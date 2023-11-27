import os
import json
import asyncio

from paramiko import SSHClient, AutoAddPolicy
from logging import Logger
from datetime import datetime
from re import match

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pymongo import MongoClient
import logging
from base64 import b64decode
from requests import get, post, exceptions
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger: Logger = logging.getLogger(__name__)
# Load environment variables from .env file
load_dotenv()

ssh = SSHClient()
ssh.set_missing_host_key_policy(AutoAddPolicy())

ssh.connect(
    os.getenv("IMPORT_SSH_HOSTNAME"),
    os.getenv("IMPORT_SSH_PORT"),
    os.getenv("IMPORT_SSH_USERNAME"),
    os.getenv("IMPORT_SSH_PASSWORD"),
)

# Get the MongoDB URL from the environment variables
mongo_url = os.getenv("MONGODB_URL")
token_path = os.path.join(os.path.dirname(__file__), '.dev-token.json')
import_mongo_url = os.getenv("IMPORT_MONGO_DB")
client = AsyncIOMotorClient(import_mongo_url)

# sequence = LT000001
# sequence = IMP00001

api_endpoint = os.getenv("API_BASE_URL")


def json_serial(obj):
    if isinstance(obj, (ObjectId, datetime)):
        return str(obj)
    print(obj)
    raise TypeError("Type non serializable")


async def populate_collection_sla(collection, headers):
    logger.info(f"Populating {collection.get('name')}...")
    cursor = client[collection.get('import_db')][collection.get('import_collection')].find()
    async for document in cursor:
        data = {
            '_id': str(document['_id']),
            "name": document['name'],
            "description": document['name'],
            "color": document['color'],
            "backgroundColor": document['couleurFond'],
            "order": document['order'],
            "timeToExpire": document['time'],
            "customFields": {
                "importData": json.loads(json.dumps(document, default=json_serial, indent=4)),
            },
            "metadata": {
                'createdAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'createdBy': 'sysimport',
                'lastUpdatedAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'lastUpdatedBy': 'sysimport',
            }
        }
        try:
            response = post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=data)
            response.raise_for_status()
            logger.info(f"{collection.get('name')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('name')}: {e.response.json().get('message')}")


async def populate_collection_entities(collection, headers):
    logger.info(f"Populating {collection.get('name')}...")
    cursor = client[collection.get('import_db')][collection.get('import_collection')].find()
    async for document in cursor:
        data = {
            '_id': str(document['_id']),
            'publicEmail': document['email'],
            'type': 99,
            'profile': {
                'commonName': document['cn'],
                'firstName': document['prenom'],
                'lastName': document['nom'],
            },
            'state': {
                'current': 1 if document.get('actif') is True else 0
            },
            "customFields": {
                "importData": json.loads(json.dumps(document, default=json_serial, indent=4)),
            },
            "metadata": {
                'createdAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'createdBy': 'sysimport',
                'lastUpdatedAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'lastUpdatedBy': 'sysimport',
            }
        }
        try:
            response = post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=data)
            response.raise_for_status()
            logger.info(f"{collection.get('name')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('name')}: {e.response.json().get('message')}")


async def populate_collection_categories(collection, headers):
    logger.info(f"Populating {collection.get('name')}...")
    cursor = client[collection.get('import_db')][collection.get('import_collection')].find()
    async for document in cursor:
        data = {
            '_id': str(document['_id']),
            'name': document['name'],
            'description': document['description'],
            'order': document['order'],
            "customFields": {
                "importData": json.loads(json.dumps(document, default=json_serial, indent=4)),
            },
            "metadata": {
                'createdAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'createdBy': 'sysimport',
                'lastUpdatedAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'lastUpdatedBy': 'sysimport',
            }
        }
        try:
            response = post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=data)
            response.raise_for_status()
            logger.info(f"{collection.get('name')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('name')}: {e.response.json().get('message')}")
        for subcat in document.get('subCategory'):
            dataSubCat = {
                'name': subcat['name'],
                'parentId': str(document['_id']),
                'description': subcat['description'],
                'order': subcat['order'],
                "customFields": {
                    "importData": json.loads(json.dumps(subcat, default=json_serial, indent=4)),
                },
                "metadata": {
                    'createdAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    'createdBy': 'sysimport',
                    'lastUpdatedAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    'lastUpdatedBy': 'sysimport',
                }
            }
            try:
                response = post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=dataSubCat)
                response.raise_for_status()
                logger.info(f"{collection.get('name')} inserted")
            except exceptions.HTTPError as e:
                logger.warning(f"Failed to insert {collection.get('name')}: {e.response.json()}")


async def populate_collection_source_requests(collection, headers):
    logger.info(f"Populating {collection.get('name')}...")
    cursor = client[collection.get('import_db')][collection.get('import_collection')].find()
    async for document in cursor:
        data = {
            '_id': str(document['_id']),
            'name': document['nom'],
            'icon': document['icone'],
            "customFields": {
                "importData": json.loads(json.dumps(document, default=json_serial, indent=4)),
            },
            "metadata": {
                'createdAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'createdBy': 'sysimport',
                'lastUpdatedAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'lastUpdatedBy': 'sysimport',
            }
        }
        try:
            response = post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=data)
            response.raise_for_status()
            logger.info(f"{collection.get('name')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('name')}: {e.response.json().get('message')}")


async def populate_collection_source_ticket(collection, headers):
    logger.info(f"Populating {collection.get('name')}...")
    cursor = client[collection.get('import_db')][collection.get('import_collection')].find({'metadata.creationDate': {
        '$gte': datetime(2023, 10, 31),
    }})
    async for document in cursor:
        lifestep = -1
        state = {'id': '000000000000000000000000', 'name': 'Inconnu'}
        if not isinstance(document['state'], int):
            lifestep = 1
            state['id'] = ObjectId(str(lifestep))
            state['name'] = str(lifestep)
        elif document['state'] == 1:
            lifestep = 1
            state['name'] = 'Nouveau'
        elif document['state'] == 2:
            lifestep = 1
            state['name'] = 'En cours'
        elif document['state'] == 3:
            lifestep = 0
            state = None
        observers = []
        if document['relatedTo'] is not None and len(str(document['relatedTo'])) > 1:
            observers.append({
                'id': str(document['relatedTo']),
                'name': document['relatedToCn'] if document['relatedToCn'] is not None else "Inconnu",
                'type': 99,
            })
        assigned = []
        if document['assignedTo'] is not None and len(str(document['assignedTo'])) > 1:
            assigned.append({
                'id': str(document['assignedTo']),
                'name': document['assignedToCn'] if document['assignedToCn'] is not None else "Inconnu",
                'type': 2,
            })
        docImport = {cle: valeur for cle, valeur in document.items() if cle != 'threads'}
        data = {
            '_id': str(document['_id']),
            'sequence': f'IMP{document["customId"]:06}',
            'subject': document['subject'],
            'envelope': {
                'senders': [
                    {
                        'id': str(document['sender']),
                        'name': document['senderCn'] if document['senderCn'] is not None else "Inconnu",
                        'type': 99,
                    },
                ],
                'observers': observers,
                'assigned': assigned,
            },
            'categories': [
                {
                    'id': str(document['category']),
                    'name': document['categoryCn'],
                },
                {
                    'id': '000000000000000000000000',
                    'name': document['subCategoryCn'],
                },
            ],
            'type': 1,
            'totalTime': document['timeSpent'],
            'lifestep': lifestep,
            'state': state,
            'priority': {
                'id': '000000000000000000000000',
                'name': 'Inconnu',
            },
            'impact': {
                'id': '000000000000000000000000',
                'name': 'Inconnu',
            },
            'sla': {
                'id': str(document['sla']),
                'name': document['slaCn'],
                'dueAt': document['dueDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ") if document['dueDate'] else None,
            },
            "customFields": {
                "importData": json.loads(json.dumps(docImport, default=json_serial, indent=4)),
            },
            "metadata": {
                'createdAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'createdBy': 'sysimport',
                'lastUpdatedAt': document['metadata']['creationDate'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                'lastUpdatedBy': 'sysimport',
            }
        }
        try:
            response = post(f"{api_endpoint}/{collection.get('endpoint')}", headers=headers, json=data)
            response.raise_for_status()
            logger.info(f"{collection.get('name')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('name')}: {e.response.json().get('message')}")

        pattern = r'\((.*?)\) <(.*?)>'
        for thread in document.get('threads'):
            threadId = thread['text'] if isinstance(thread['text'], ObjectId) else ObjectId()
            typeThread = 0
            if thread['type'] == 'external':
                typeThread = 4
            elif thread['type'] == 'internal':
                typeThread = 2
            elif thread['type'] == 'shared':
                typeThread = 5
            elif thread['type'] == 'system':
                typeThread = 1
            fragments = []
            if isinstance(thread['text'], ObjectId):
                mailStore = await client[collection.get('import_db_mail')][collection.get('import_collection_mail')].find_one({
                    "_id": threadId,
                })
                if mailStore is None:
                    print(f"IgnoredThread : {str(thread['text'])}")
                    continue
                userstorage = await client[collection.get('import_db_fs')][collection.get('import_collection_fs')].find_one({
                    "_id": mailStore['emlSource'],
                })
                if userstorage is None:
                    print(f"IgnoredMail : {mailStore['subject']}")
                    continue
                fragments.append({
                    "id": str(mailStore['_id']),
                    "disposition": "file",
                    "filestorage": {
                        "id": str(userstorage['_id']),
                        "name": f"{str(userstorage['_id'])}.eml",
                        "namespace": "ticket",
                        "path": f"imports/{str(document['_id'])}/incoming/{str(mailStore['_id'])}/{str(userstorage['_id'])}.eml",
                        "mime": "message/rfc822"
                    },
                })
                fromMailInfo = None
                if thread.get('from') is not None:
                    if isinstance(thread['from'], list) and len(thread['from']) == 0:
                        thread['from'] = ''
                    matchFrom = match(pattern, thread['from'][0] if isinstance(thread['from'], list) and len(thread['from']) > 0 else thread['from'])
                    if matchFrom is not None:
                        fromMailInfo = {
                            "name": matchFrom.group(1),
                            "address": matchFrom.group(2),
                        }
                toMailInfo = None
                if thread.get('to') is not None:
                    if isinstance(thread['to'], list) and len(thread['to']) == 0:
                        thread['to'] = ''
                    matchTo = match(pattern, thread['to'][0] if isinstance(thread['to'], list) and len(thread['to']) > 0 else thread['to'])
                    if matchTo is not None:
                        toMailInfo = {
                            "name": matchTo.group(1),
                            "address": matchTo.group(2),
                        }
                ccMailInfo = None
                if thread.get('cc') is not None:
                    if isinstance(thread['cc'], list) and len(thread['cc']) == 0:
                        thread['cc'] = ''
                    matchCc = match(pattern, thread['cc'][0] if isinstance(thread['cc'], list) and len(thread['cc']) > 0 else thread['cc'])
                    if matchCc is not None:
                        ccMailInfo = {
                            "name": matchCc.group(1),
                            "address": matchCc.group(2),
                        }
                filestorage = None
                if thread['type'] == 'external':
                    filestorage = {
                        "id": str(userstorage['_id']),
                        "name": f"{str(userstorage['_id'])}.eml",
                        "namespace": "ticket",
                        "path": f"imports/{str(document['_id'])}/incoming/{str(mailStore['_id'])}/{str(userstorage['_id'])}.eml",
                        "mime": "message/rfc822"
                    }

                mailinfo = {
                    "account": "sysimport",
                    "subject": thread['mailtitle'],
                    "messageId": thread['messageId'],
                    "from": fromMailInfo,
                    "to": [toMailInfo] if toMailInfo else [],
                    "cc": [ccMailInfo] if ccMailInfo else [],
                    "filestorage": filestorage,
                }
            else:
                try:
                    response = get(f"{api_endpoint}/{collection.get('endpointThread')}?filters%5BticketId%5D={str(document['_id'])}&filters%5B%3DcustomFields.importData.date%5D={thread['date']}&filters%5B%3DcustomFields.importData.text%5D={thread['text']}", headers=headers)
                    response.raise_for_status()
                    verifyThread = False if len(response.json()['data']) > 0 else True
                except exceptions.HTTPError as e:
                    logger.warning(f"Failed to search thread duplicate with text : <{thread['text']}>: {e.response.json()}")
                    verifyThread = False
                if not verifyThread:
                    print(f"Ignore duplicate thread with text : <{thread['text']}>")
                    continue
                fragments.append({
                    "id": str(ObjectId()),
                    "disposition": "raw",
                    "message": thread['text'],
                })
                mailinfo = None
            dataThread = {
                "_id": str(threadId),
                "ticketId": str(document['_id']),
                "type": typeThread,
                "fragments": fragments,
                "mailinfo": mailinfo,
                "customFields": {
                    "importData": json.loads(json.dumps(thread, default=json_serial, indent=4)),
                },
                "metadata": {
                    'createdAt': thread['date'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    'createdBy': 'sysimport',
                    'lastUpdatedAt': thread['date'].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    'lastUpdatedBy': 'sysimport',
                }
            }
            try:
                response = post(f"{api_endpoint}/{collection.get('endpointThread')}",
                                         headers=headers, json=dataThread)
                response.raise_for_status()
                logger.info(f"{collection.get('name')} inserted")
            except exceptions.HTTPError as e:
                logger.warning(f"Failed to insert {collection.get('nameThread')}: {e.response.json()}")


async def populate_collection_filestorage(collection, headers):
    logger.info(f"Populating {collection.get('name')}...")
    cursor = client[collection.get('import_db')][collection.get('import_collection')].find({
        'nameSpace': 'gridfs',
        'type': 1,
        'metadata.creationDate': {
            '$gte': datetime(2023, 10, 31),
        },
    })
    sftp = ssh.open_sftp()
    async for document in cursor:
        mailStore = await client[collection.get('import_db_mail')][collection.get('import_collection_mail')].find_one({
            "emlSource": document['_id'],
        })
        if mailStore is None:
            print(f"Ignoredfile : {document['filename']}")
            continue
        ticket = await client[collection.get('import_db_ticket')][collection.get('import_collection_ticket')].find_one({
            "categoryCn": {
                '$ne': "Supervision",
            },
            "threads.text": mailStore['_id'],
        })
        if ticket is None:
            print(f"Ignore mail : {document['filename']}")
            continue
        remote_file = sftp.open(os.getenv("IMPORT_SSH_BASEPATH") + document['path'])
        decoded_file = b64decode(remote_file.read())
        files = {'file': decoded_file}
        # noinspection PyUnresolvedReferences
        data = {
            '_id': str(document['_id']),
            'type': 'f',
            'namespace': 'ticket',
            'path': f"imports/{str(ticket['_id'])}/incoming/{str(mailStore['_id'])}/{str(document['_id'])}.eml",
            'mime': 'message/rfc822',
            'file': decoded_file,
            # 'metadata': {
            #     'createdAt': document['metadata']['creationDate'],
            #     'createdBy': 'sysimport',
            #     'lastUpdatedBy': document['metadata']['creationDate'],
            #     'lastUpdatedAt': 'sysimport',
            # }
        }
        try:
            response = post(f"{api_endpoint}/{collection.get('endpoint')}", data=data, files=files)
            response.raise_for_status()
            logger.info(f"{collection.get('name')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('name')}: {e} \n {e.response.text}")

collections = [
    {
        "name": "sla",
        "import_db": "libertech-data",
        "import_collection": "tickets_sla",
        "endpoint": "tickets/sla",
        "method": populate_collection_sla
    },
    {
        "name": "entities",
        "import_db": "libertech-data",
        "import_collection": "peoples",
        "endpoint": "core/entities",
        "method": populate_collection_entities
    },
    {
        "name": "categories",
        "import_db": "libertech-data",
        "import_collection": "tickets_category",
        "endpoint": "core/categories",
        "method": populate_collection_categories
    },
    {
        "name": "source-requests",
        "import_db": "libertech-data",
        "import_collection": "tickets_sourcetype",
        "endpoint": "tickets/source-request",
        "method": populate_collection_source_requests
    },
    # {
    #     "name": "ticket",
    #     "nameThread": "thread",
    #     "import_db_mail": "mails",
    #     "import_db": "libertech-data",
    #     "import_db_fs": "libertech-sys",
    #     "import_collection": "tickets",
    #     "import_collection_fs": "userstorage",
    #     "import_collection_mail": "mailsStore",
    #     "endpoint": "tickets/ticket",
    #     "endpointThread": "tickets/thread",
    #     "method": populate_collection_source_ticket
    # },
    # {
    #     "name": "filestorage",
    #     "import_db": "libertech-sys",
    #     "import_db_ticket": "libertech-data",
    #     "import_db_mail": "mails",
    #     "import_collection": "userstorage",
    #     "import_collection_ticket": "tickets",
    #     "import_collection_mail": "mailsStore",
    #     "endpoint": "core/filestorage",
    #     "method": populate_collection_filestorage,
    # },
]


async def main():
    print(token_path)
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
