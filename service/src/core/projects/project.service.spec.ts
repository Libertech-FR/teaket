import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { ProjectService } from './project.service'
import { getModelToken } from '@nestjs/mongoose'
import { Project } from './_schemas/project.schema'
import { Model, Types } from 'mongoose'

describe('ProjectService', () => {
  let service: ProjectService
  let model: Model<Project>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockProject: Project = {
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
        ProjectService,
        {
          provide: getModelToken(Project.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<ProjectService>(ProjectService)
    model = module.get<Model<Project>>(getModelToken(Project.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockProject))
      const result = await service.create(createTest)
      expect(result).toEqual(mockProject)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockProject]
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
    it('should return a Project record by ID', async () => {
      const expected = mockProject
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Project record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Project record by ID with metadata', async () => {
      const projectDto = { info: { key: 'updated value' } }
      const newObject = { ...mockProject }
      const expected = newObject.info.push(projectDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), projectDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Project record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
