import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { PreferencesService } from './preferences.service'
import { getModelToken } from '@nestjs/mongoose'
import { Preferences } from './_schemas/preferences.schema'
import { Model, Types } from 'mongoose'

describe('PreferencesService', () => {
  let service: PreferencesService
  let model: Model<Preferences>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockPreferences: Preferences = {
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
        PreferencesService,
        {
          provide: getModelToken(Preferences.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<PreferencesService>(PreferencesService)
    model = module.get<Model<Preferences>>(getModelToken(Preferences.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockPreferences))
      const result = await service.create(createTest)
      expect(result).toEqual(mockPreferences)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockPreferences]
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
    it('should return a Preferences record by ID', async () => {
      const expected = mockPreferences
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Preferences record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Preferences record by ID with metadata', async () => {
      const preferencesDto = { info: { key: 'updated value' } }
      const newObject = { ...mockPreferences }
      const expected = newObject.info.push(preferencesDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), preferencesDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Preferences record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
