import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { FormService } from './form.service'
import { getModelToken } from '@nestjs/mongoose'
import { Form } from './_schemas/form.schema'
import { Model, Types } from 'mongoose'

describe('FormService', () => {
  let service: FormService
  let model: Model<Form>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockForm: Form = {
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
        FormService,
        {
          provide: getModelToken(Form.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<FormService>(FormService)
    model = module.get<Model<Form>>(getModelToken(Form.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockForm))
      const result = await service.create(createTest)
      expect(result).toEqual(mockForm)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockForm]
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
    it('should return a Form record by ID', async () => {
      const expected = mockForm
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Form record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Form record by ID with metadata', async () => {
      const formDto = { info: { key: 'updated value' } }
      const newObject = { ...mockForm }
      const expected = newObject.info.push(formDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), formDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Form record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
