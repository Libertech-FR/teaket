import logging
import json
from logging import Logger
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
from .json_serial import json_serial
from requests import post, exceptions
from .populate_threads import populate_tickets_threads

logging.basicConfig(level=logging.INFO)
logger: Logger = logging.getLogger(__name__)


async def populate_tickets(collection, headers):
    api_endpoint = collection.get('api_endpoint')
    client: AsyncIOMotorClient = collection.get('mongo')
    logger.info(f"Populating {collection.get('teaket_endpoint')}...")
    cursor = client[collection.get('gaia_db')][collection.get('gaia_collection')].find({'metadata.creationDate': {
        '$gte': datetime(2023, 10, 24),
    },
        "categoryCn": {
            '$ne': "Supervision",
        },
    })
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
            response = post(f"{api_endpoint}/{collection.get('teaket_endpoint')}", headers=headers, json=data)
            response.raise_for_status()
            logger.info(f"{collection.get('teaket_endpoint')} inserted")
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to insert {collection.get('teaket_endpoint')}: {e.response.json().get('message')}")

        for thread in document.get('threads'):
            await populate_tickets_threads(collection, document, thread, headers)
