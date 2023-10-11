import ObjectId from 'bson-objectid'

export function generateMongoId(id: string = ''): ObjectId {
  if (id) {
    return new ObjectId(id)
  }
  return new ObjectId()
}

export function generateStringMongoId(id: string = ''): string {
  if (id) {
    return new ObjectId(id).toHexString()
  }
  return new ObjectId().toHexString()
}
