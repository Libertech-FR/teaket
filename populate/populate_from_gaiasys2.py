import os
import json
import asyncio
from paramiko import SSHClient, AutoAddPolicy
from logging import Logger
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
from populate_from_gaiasys.populate_tickets import populate_tickets

logging.basicConfig(level=logging.INFO)
logger: Logger = logging.getLogger(__name__)
load_dotenv()

ssh = SSHClient()
ssh.set_missing_host_key_policy(AutoAddPolicy())

ssh.connect(
    os.getenv("IMPORT_SSH_HOSTNAME"),
    os.getenv("IMPORT_SSH_PORT"),
    os.getenv("IMPORT_SSH_USERNAME"),
    os.getenv("IMPORT_SSH_PASSWORD"),
)

mongo_url = os.getenv("MONGODB_URL")
token_path = os.path.join(os.path.dirname(__file__), '.dev-token.json')
import_mongo_url = os.getenv("IMPORT_MONGO_DB")
client = AsyncIOMotorClient(import_mongo_url)

api_endpoint = os.getenv("API_BASE_URL")
sftp = ssh.open_sftp()


collections = [
    {
        "gaia_db": "libertech-data",
        "gaia_db_fs": "libertech-sys",
        "gaia_db_mail": "mails",

        "gaia_collection": "tickets",
        "gaia_collection_fs": "userstorage",
        "gaia_collection_mail": "mailsStore",

        "teaket_endpoint": "tickets/ticket",
        "teaket_endpoint_thread": "tickets/thread",
        "teaket_endpoint_mail": "core/filestorage",

        "method": populate_tickets,
        "mongo": client,
        "sftp": sftp,
        "ssh_basepath": os.getenv("IMPORT_SSH_BASEPATH"),
        "api_endpoint": api_endpoint,
    },
]


async def main():
    with open(token_path) as f:
        token = json.load(f).get("access_token")
        logger.info(f"Load DEV Token <{token}>")
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }
    collection_tasks = [col.get('method')(col, headers) for col in collections]
    await asyncio.gather(*collection_tasks)
    print("DB populated")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
