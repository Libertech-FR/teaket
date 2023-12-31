import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { StateService } from './state.service'
import { getModelToken } from '@nestjs/mongoose'
import { State } from '~/tickets/state/_schemas/state.schema'
import { Model, Types } from 'mongoose'

describe('StateService', () => {
  let service: StateService
  let model: Model<State>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockStates: State = {
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
        StateService,
        {
          provide: getModelToken(States.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<StateService>(StateService)
    model = module.get<Model<States>>(getModelToken(States.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockStates))
      const result = await service.create(createTest)
      expect(result).toEqual(mockStates)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockStates]
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
    it('should return a States record by ID', async () => {
      const expected = mockStates
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if States record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a States record by ID with metadata', async () => {
      const StatesDto = { info: { key: 'updated value' } }
      const newObject = { ...mockStates }
      const expected = newObject.info.push(StatesDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), StatesDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a States record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
