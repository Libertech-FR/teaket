import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { getModelToken } from '@nestjs/mongoose'
import { Auth } from './_schemas/auth.schema'
import { Model, Types } from 'mongoose'

describe('AuthService', () => {
  let service: AuthService
  let model: Model<Auth>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockAuth: Auth = {
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
        AuthService,
        {
          provide: getModelToken(Auth.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<AuthService>(AuthService)
    model = module.get<Model<Auth>>(getModelToken(Auth.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockAuth))
      const result = await service.create(createTest)
      expect(result).toEqual(mockAuth)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockAuth]
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
    it('should return a Auth record by ID', async () => {
      const expected = mockAuth
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Auth record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Auth record by ID with metadata', async () => {
      const authDto = { info: { key: 'updated value' } }
      const newObject = { ...mockAuth }
      const expected = newObject.info.push(authDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), authDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Auth record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
