import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { FilestorageService } from './filestorage.service'
import { getModelToken } from '@nestjs/mongoose'
import { Filestorage } from './_schemas/filestorage.schema'
import { Model, Types } from 'mongoose'

describe('FilestorageService', () => {
  let service: FilestorageService
  let model: Model<Filestorage>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockFilestorage: Filestorage = {
    _id,
    metadata: {
      createdAt: date,
      createdBy: 'console',
      lastUpdateAt: date,
      lastUpdateBy: 'console',
    },
    info: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilestorageService,
        {
          provide: getModelToken(Filestorage.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<FilestorageService>(FilestorageService)
    model = module.get<Model<Filestorage>>(getModelToken(Filestorage.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockFilestorage))
      const result = await service.create(createTest)
      expect(result).toEqual(mockFilestorage)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockFilestorage]
      const total = 1
      jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(total)
      jest.spyOn(model, 'find').mockResolvedValueOnce(expected)
      const [result, resultTotal] = await service.search()
      expect(result).toEqual(expected)
      expect(resultTotal).toEqual(total)
    })

    it('should return an empty array if no records are found', async () => {
      const expected = []
      const total = 0
      jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(total)
      jest.spyOn(model, 'find').mockResolvedValueOnce(expected)
      const [result, resultTotal] = await service.search()
      expect(result).toEqual(expected)
      expect(resultTotal).toEqual(total)
    })
  })

  describe('read', () => {
    it('should return a Filestorage record by ID', async () => {
      const expected = mockFilestorage
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Filestorage record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Filestorage record by ID with metadata', async () => {
      const filestorageDto = { info: { key: 'updated value' } }
      const newObject = { ...mockFilestorage }
      const expected = newObject.info.push(filestorageDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), filestorageDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Filestorage record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
