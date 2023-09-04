import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from './categories.service'
import { getModelToken } from '@nestjs/mongoose'
import { Categories } from './schemas/categories.schema'
import { Model, Types } from 'mongoose'

describe('CategoriesService', () => {
  let service: CategoriesService
  let model: Model<Categories>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockCategories: Categories = {
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
        CategoriesService,
        {
          provide: getModelToken(Categories.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<CategoriesService>(CategoriesService)
    model = module.get<Model<Categories>>(getModelToken(Categories.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockCategories))
      const result = await service.create(createTest)
      expect(result).toEqual(mockCategories)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockCategories]
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
    it('should return a Categories record by ID', async () => {
      const expected = mockCategories
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Categories record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Categories record by ID with metadata', async () => {
      const categoriesDto = { info: { key: 'updated value' } }
      const newObject = { ...mockCategories }
      const expected = newObject.info.push(categoriesDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), categoriesDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Categories record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
