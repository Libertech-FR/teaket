import ObjectId from 'bson-objectid'

export function generateMongoId(id: string = '') {
  if (id) {
    return new ObjectId(id)
  }
  return new ObjectId()
}
