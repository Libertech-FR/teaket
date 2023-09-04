import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { SourceRequestService } from './source-request.service'
import { getModelToken } from '@nestjs/mongoose'
import { SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'
import { Model, Types } from 'mongoose'

describe('SourceRequestService', () => {
  let service: SourceRequestService
  let model: Model<SourceRequest>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockSourceRequest: SourceRequest = {
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
        SourceRequestService,
        {
          provide: getModelToken(SourceRequest.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<SourceRequestService>(SourceRequestService)
    model = module.get<Model<SourceRequest>>(getModelToken(SourceRequest.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockSourceRequest))
      const result = await service.create(createTest)
      expect(result).toEqual(mockSourceRequest)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockSourceRequest]
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
    it('should return a SourceRequest record by ID', async () => {
      const expected = mockSourceRequest
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if SourceRequest record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a SourceRequest record by ID with metadata', async () => {
      const source-requestDto = { info: { key: 'updated value' } }
      const newObject = { ...mockSourceRequest }
      const expected = newObject.info.push(source-requestDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), source-requestDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a SourceRequest record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
