import json
import logging
from logging import Logger
from motor.motor_asyncio import AsyncIOMotorClient
# from datetime import datetime
from requests import post, exceptions
from base64 import b64decode
from paramiko import SFTPClient

logging.basicConfig(level=logging.INFO)
logger: Logger = logging.getLogger(__name__)


async def populate_tickets_filestorages(collection, thread):
    api_endpoint = collection.get('api_endpoint')
    client: AsyncIOMotorClient = collection.get('mongo')
    sftp: SFTPClient = collection.get('sftp')
    ssh_basepath = collection.get('ssh_basepath')

    logger.info(f"Populating {collection.get('teaket_endpoint_mail')}...")

    mailStore = await client[collection.get('gaia_db_mail')][collection.get('gaia_collection_mail')].find_one({
        '_id': thread['text'],
        # "emlSource": document['_id'],
    })
    if mailStore is None:
        print(f"Ignoredfile : {thread['text']}")
        return

    document = await client[collection.get('gaia_db_fs')][collection.get('gaia_collection_fs')].find_one({
        '_id': mailStore['emlSource'],
        'nameSpace': 'gridfs',
        'type': 1,
        # 'metadata.creationDate': {
        #     '$gte': datetime(2023, 10, 31),
        # },
    })
    if document is None:
        print(f"Ignoredfile : {mailStore['emlSource']}")
        return
    ticket = await client[collection.get('gaia_db')][collection.get('gaia_collection')].find_one({
        "categoryCn": {
            '$ne': "Supervision",
        },
        "threads.text": mailStore['_id'],
    })
    if ticket is None:
        print(f"Ignore mail : {document['filename']}")
        return
    # if document['path'] is None:
    #     print(f"Ignoredfile : {document['_id']}, path is None")
    #     return
    remote_file = sftp.open(ssh_basepath + document['path'])
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
        response = post(f"{api_endpoint}/{collection.get('teaket_endpoint_mail')}", data=data, files=files)
        response.raise_for_status()
        logger.info(f"{collection.get('teaket_endpoint_mail')} inserted")
    except exceptions.HTTPError as e:
        logger.warning(f"Failed to insert {collection.get('teaket_endpoint_mail')}: {e} \n {e.response.text}")
