from bson import ObjectId
from datetime import datetime

def json_serial(obj):
    if isinstance(obj, (ObjectId, datetime)):
        return str(obj)
    print(obj)
    raise TypeError("Type non serializable")

