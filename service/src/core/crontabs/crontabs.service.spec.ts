import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { CrontabsService } from './crontabs.service'
import { getModelToken } from '@nestjs/mongoose'
import { Crontabs } from './schemas/crontabs.schema'
import { Model, Types } from 'mongoose'

describe('CrontabsService', () => {
  let service: CrontabsService
  let model: Model<Crontabs>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockCrontabs: Crontabs = {
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
        CrontabsService,
        {
          provide: getModelToken(Crontabs.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<CrontabsService>(CrontabsService)
    model = module.get<Model<Crontabs>>(getModelToken(Crontabs.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockCrontabs))
      const result = await service.create(createTest)
      expect(result).toEqual(mockCrontabs)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockCrontabs]
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
    it('should return a Crontabs record by ID', async () => {
      const expected = mockCrontabs
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Crontabs record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Crontabs record by ID with metadata', async () => {
      const crontabsDto = { info: { key: 'updated value' } }
      const newObject = { ...mockCrontabs }
      const expected = newObject.info.push(crontabsDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), crontabsDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Crontabs record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
