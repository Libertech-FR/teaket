import os
import json
import asyncio
import motor.motor_asyncio
from dotenv import load_dotenv
import logging
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Load environment variables from .env file
load_dotenv()

token_path = os.path.join(os.path.dirname(__file__), '.dev-token.json')
collections = [
    {
        "name": "identities",
        "file": "identities.json",
        "endpoint": "core/identities",
    },
    {
        "name": "entities",
        "file": "entities.json",
        "endpoint": "core/entities",
    },
    {
        "name": "categories",
        "file": "categories.json",
        "endpoint": "core/categories",
    },
    {
        "name": "sla",
        "file": "sla.json",
        "endpoint": "tickets/sla",
    },
    {
        "name": "source-requests",
        "file": "source-requests.json",
        "endpoint": "tickets/source-request",
    },
    {
        "name": "states",
        "file": "states.json",
        "endpoint": "tickets/state",
    },
    {
        "name": "crontabs",
        "file": "crontabs.json",
        "endpoint": "core/crontabs",
    },
    {
        "name": "projects",
        "file": "projects.json",
        "endpoint": "core/project",
    },
    {
        "name": "triggers",
        "file": "triggers.json",
        "endpoint": "core/triggers",
    },
    {
        "name": "tickets",
        "file": "tickets.json",
        "endpoint": "tickets/ticket",
    },
    {
        "name": "threads",
        "file": "threads.json",
        "endpoint": "tickets/thread",
    },
]

api_endpoint = os.getenv("API_BASE_URL")

async def populate_collection(collection, token):
    logger.info(f"Populating {collection.get('name')}...")
    file_path = os.path.join(os.path.dirname(__file__), 'seeds', collection.get('file'))
    headers = {
        "Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=utf-8"
    }
    with open(file_path) as f:
        datas = json.load(f)
        for data in datas:
            try:

                response = requests.post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=data )
                response.raise_for_status()
                logger.info(f"{collection.get('name')} inserted")
            except Exception as e:
                error_message = response.json().get('message')
                logger.warning(f"Failed to insert {collection.get('name')}: {error_message}")

async def main():
    with open(token_path) as f:
        token = json.load(f).get("access_token")
    collection_tasks = [populate_collection(col, token) for col in collections]
    await asyncio.gather(*collection_tasks)

    print("DB populated")

if __name__ == "__main__":
    asyncio.run(main())