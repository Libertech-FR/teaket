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

# Get the MongoDB URL from the environment variables
mongo_url = os.getenv("MONGODB_URL")
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

# async def populate_collection(collection_name, db):
#     print(f"Populating {collection_name}...")
#     file_path = os.path.join(os.path.dirname(__file__), 'seeds', f"{collection_name}.json")
#     with open(file_path) as f:
#         data = json.load(f)
#         for d in data:
#             d["_id"] = ObjectId(d["_id"])
#         try:
#             result = await db[collection_name].insert_many(data)
#             logger.info(f"{len(result.inserted_ids)} {collection_name} inserted")
#         except Exception as e:
#             logger.warning(f"Duplicate key error: {e}")
#             logger.warning(f"Skipping {collection_name}...")

api_endpoint = os.getenv("API_BASE_URL")

async def populate_collection(collection):
    logger.info(f"Populating {collection.get('name')}...")
    file_path = os.path.join(os.path.dirname(__file__), 'seeds', collection.get('file'))
    with open(file_path) as f:
        datas = json.load(f)
        for data in datas:
            try:
                response = requests.post(f"{api_endpoint}/{collection.get('endpoint')}", json=data)
                response.raise_for_status()
                logger.info(f"{collection.get('name')} inserted")
            except Exception as e:
                logger.warning(f"Failed to insert {collection.get('name')}: {e}")

async def main():
    collection_tasks = [populate_collection(col) for col in collections]
    await asyncio.gather(*collection_tasks)

    print("DB populated")

if __name__ == "__main__":
    asyncio.run(main())