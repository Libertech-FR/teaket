import logging
import json
from logging import Logger
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from .json_serial import json_serial
from re import match
from requests import get, post, exceptions
from.populate_filestorages import populate_tickets_filestorages

logging.basicConfig(level=logging.INFO)
logger: Logger = logging.getLogger(__name__)


async def populate_tickets_threads(collection, document, thread, headers):
    api_endpoint = collection.get('api_endpoint')
    client: AsyncIOMotorClient = collection.get('mongo')
    pattern = r'\((.*?)\) <(.*?)>'

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
        mailStore = await client[collection.get('gaia_db_mail')][collection.get('gaia_collection_mail')].find_one({
            "_id": threadId,
        })
        if mailStore is None:
            print(f"IgnoredThread : {str(thread['text'])}")
            return
        await populate_tickets_filestorages(collection, thread)
        userstorage = await client[collection.get('gaia_db_fs')][collection.get('gaia_collection_fs')].find_one({
            "_id": mailStore['emlSource'],
        })
        if userstorage is None:
            print(f"IgnoredMail : {mailStore['subject']}")
            return
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
            matchFrom = match(pattern,
                              thread['from'][0] if isinstance(thread['from'], list) and len(thread['from']) > 0 else
                              thread['from'])
            if matchFrom is not None:
                fromMailInfo = {
                    "name": matchFrom.group(1),
                    "address": matchFrom.group(2),
                }
        toMailInfo = None
        if thread.get('to') is not None:
            print("thread['to']")
            print(thread['to'])
            if isinstance(thread['to'], list) and len(thread['to']) == 0:
                thread['to'] = ''
            matchTo = match(pattern,
                            thread['to'][0] if isinstance(thread['to'], list) and len(thread['to']) > 0 else thread[
                                'to'])
            if matchTo is not None:
                toMailInfo = {
                    "name": matchTo.group(1),
                    "address": matchTo.group(2),
                }
        ccMailInfo = None
        if thread.get('cc') is not None:
            if isinstance(thread['cc'], list) and len(thread['cc']) == 0:
                thread['cc'] = ''
            matchCc = match(pattern,
                            thread['cc'][0] if isinstance(thread['cc'], list) and len(thread['cc']) > 0 else thread[
                                'cc'])
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
        print(mailinfo)
    else:
        try:
            response = get(
                f"{api_endpoint}/{collection.get('teaket_endpoint_thread')}?filters%5BticketId%5D={str(document['_id'])}&filters%5B%3DcustomFields.importData.date%5D={thread['date']}&filters%5B%3DcustomFields.importData.text%5D={thread['text']}",
                headers=headers)
            response.raise_for_status()
            verifyThread = False if len(response.json()['data']) > 0 else True
        except exceptions.HTTPError as e:
            logger.warning(f"Failed to search thread duplicate with text : <{thread['text']}>: {e.response.json()}")
            verifyThread = False
        if not verifyThread:
            print(f"Ignore duplicate thread with text : <{thread['text']}>")
            return
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
        response = post(f"{api_endpoint}/{collection.get('teaket_endpoint_thread')}",
                        headers=headers, json=dataThread)
        response.raise_for_status()
        logger.info(f"{collection.get('teaket_endpoint_thread')} inserted")
    except exceptions.HTTPError as e:
        logger.warning(f"Failed to insert {collection.get('teaket_endpoint_thread')}: {e.response.json()}")
