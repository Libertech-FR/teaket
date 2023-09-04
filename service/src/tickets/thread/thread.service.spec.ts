import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { ThreadService } from './thread.service'
import { getModelToken } from '@nestjs/mongoose'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { Model, Types } from 'mongoose'

describe('ThreadService', () => {
  let service: ThreadService
  let model: Model<Thread>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockThread: Thread = {
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
        ThreadService,
        {
          provide: getModelToken(Thread.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<ThreadService>(ThreadService)
    model = module.get<Model<Thread>>(getModelToken(Thread.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockThread))
      const result = await service.create(createTest)
      expect(result).toEqual(mockThread)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockThread]
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
    it('should return a Thread record by ID', async () => {
      const expected = mockThread
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Thread record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Thread record by ID with metadata', async () => {
      const threadDto = { info: { key: 'updated value' } }
      const newObject = { ...mockThread }
      const expected = newObject.info.push(threadDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), threadDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Thread record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
