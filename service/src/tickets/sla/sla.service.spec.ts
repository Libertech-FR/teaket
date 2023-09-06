import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { SlaService } from './sla.service'
import { getModelToken } from '@nestjs/mongoose'
import { Sla } from './_schemas/sla.schema'
import { Model, Types } from 'mongoose'

describe('SlaService', () => {
  let service: SlaService
  let model: Model<Sla>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockSla: Sla = {
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
        SlaService,
        {
          provide: getModelToken(Sla.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<SlaService>(SlaService)
    model = module.get<Model<Sla>>(getModelToken(Sla.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockSla))
      const result = await service.create(createTest)
      expect(result).toEqual(mockSla)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockSla]
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
    it('should return a Sla record by ID', async () => {
      const expected = mockSla
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Sla record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Sla record by ID with metadata', async () => {
      const slaDto = { info: { key: 'updated value' } }
      const newObject = { ...mockSla }
      const expected = newObject.info.push(slaDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), slaDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Sla record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
