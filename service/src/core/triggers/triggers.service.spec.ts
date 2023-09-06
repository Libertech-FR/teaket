import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { TriggersService } from './triggers.service'
import { getModelToken } from '@nestjs/mongoose'
import { Triggers } from './_schemas/triggers.schema'
import { Model, Types } from 'mongoose'

describe('TriggersService', () => {
  let service: TriggersService
  let model: Model<Triggers>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockTriggers: Triggers = {
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
        TriggersService,
        {
          provide: getModelToken(Triggers.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<TriggersService>(TriggersService)
    model = module.get<Model<Triggers>>(getModelToken(Triggers.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockTriggers))
      const result = await service.create(createTest)
      expect(result).toEqual(mockTriggers)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockTriggers]
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
    it('should return a Triggers record by ID', async () => {
      const expected = mockTriggers
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Triggers record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Triggers record by ID with metadata', async () => {
      const triggersDto = { info: { key: 'updated value' } }
      const newObject = { ...mockTriggers }
      const expected = newObject.info.push(triggersDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), triggersDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Triggers record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
