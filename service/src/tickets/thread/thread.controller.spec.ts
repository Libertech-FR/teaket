import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { ThreadController } from './thread.controller'
import { ThreadService } from './thread.service'
import { ThreadDto } from '~/tickets/thread/_dto/thread.dto'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Types } from 'mongoose'
import { Response, Request } from 'express'
import { getMockReq, getMockRes } from '@jest-mock/express'

describe('ThreadController', () => {
  let controller: ThreadController
  let service: ThreadService
  const date = new Date()
  const _id = new Types.ObjectId()
  const { res, mockClear } = getMockRes()
  const object: Thread = {
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
    mockClear()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreadController],
      providers: [
        ThreadService,
        {
          provide: ThreadService,
          useValue: {
            search: jest.fn().mockResolvedValue([[object], 1]),
            create: jest.fn().mockResolvedValue(object),
            read: jest.fn().mockResolvedValue(object),
            update: jest.fn().mockResolvedValue(object),
            remove: jest.fn().mockResolvedValue({
              acknowledged: true,
              deletedCount: 1,
            }),
          },
        },
      ],
    }).compile()

    controller = module.get<ThreadController>(ThreadController)
    service = module.get<ThreadService>(ThreadService)
  })

  describe('search', () => {
    it('should return an array of Thread objects and the total count', async () => {
      const req = getMockReq()
      const query = { _id: _id.toString() }
      const limit = 10
      const skip = 1
      const expectedResult: [Thread[], number] = [[object], 1]
      jest.spyOn(service, 'search').mockImplementation(async () => await expectedResult)
      const response = await controller.search(req, res, query, limit.toString(), skip.toString(), null)
      expect(response.json).toHaveBeenCalledWith({ data: expectedResult[0], total: expectedResult[1] })
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK)
    })

    it('should return an array of Thread objects with default pagination', async () => {
      const req = getMockReq()
      const query = { _id: _id.toString() }
      const limit = 0
      const skip = 0
      const expectedResult: [Thread[], number] = [[object], 1]
      jest.spyOn(service, 'search').mockImplementation(async () => await expectedResult)
      const response = await controller.search(req, res, query, limit.toString(), skip.toString(), null)
      expect(response.json).toHaveBeenCalledWith({ data: expectedResult[0], total: expectedResult[1] })
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK)
    })

    it('should throw HttpException with BAD_REQUEST status when an error occurs', async () => {
      const req = {} as Request
      const res = {} as Response
      const query = { someParam: 'value' }
      const limit = 10
      const skip = 0
      jest.spyOn(service, 'search').mockRejectedValue(new Error('Something went wrong'))

      try {
        await controller.search(req, res, query, limit.toString(), skip.toString(), null)
      } catch (error) {
        const status = error.getStatus()
        const response = error.getResponse()

        expect(error).toBeInstanceOf(HttpException)
        expect(status).toBe(400)
        expect(response).toBe('Something went wrong')
      }
    })
  })

  describe('read', () => {
    it('should return the data successfully', async () => {
      const expectedResult: Thread = object
      jest.spyOn(service, 'read').mockImplementation(async () => await expectedResult)
      const result = await controller.read(_id.toString(), res)
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(res.json).toHaveBeenCalledWith(expectedResult)
      expect(result).toEqual(res)
    })

    it('should throw an HttpException with the error message', async () => {
      const errorMessage = 'Error message'
      jest.spyOn(service, 'read').mockRejectedValue(new Error(errorMessage))
      try {
        await controller.read(_id.toString(), res)
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST)
        expect(error.getResponse()).toBe(errorMessage)
      }
    })
  })

  describe('create', () => {
    it('should return a Thread object', async () => {
      const dto: ThreadDto = { someProp: 'value' }
      const expectedResult = object
      jest.spyOn(service, 'create').mockImplementation(async () => await expectedResult)
      const response = await controller.create(dto, res)
      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED)
      expect(response.json).toHaveBeenCalledWith(expectedResult)
    })

    it('should throw HttpException with BAD_REQUEST status when an error occurs', async () => {
      const dto: ThreadDto = { someProp: 'value' }
      jest.spyOn(service, 'create').mockRejectedValue(new Error('Something went wrong'))

      try {
        await controller.create(dto, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.getStatus()).toBe(400)
        expect(error.getResponse()).toBe('Something went wrong')
      }
    })
  })

  describe('update', () => {
    it('should return a Thread object', async () => {
      const id = _id.toString()
      const dto: ThreadDto = { someProp: 'value' }
      const expectedResult: Thread = object
      jest.spyOn(service, 'update').mockImplementation(async () => await expectedResult)
      const response = await controller.update(id, dto, res)
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(response.json).toHaveBeenCalledWith(expectedResult)
    })

    it('should throw HttpException with BAD_REQUEST status when an error occurs', async () => {
      const id = _id.toString()
      const dto: ThreadDto = { someProp: 'value' }
      jest.spyOn(service, 'update').mockRejectedValue(new Error('Something went wrong'))

      try {
        await controller.update(id, dto, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.getStatus()).toBe(400)
        expect(error.getResponse()).toBe('Something went wrong')
      }
    })
  })

  describe('remove', () => {
    it('should return a Thread object', async () => {
      const id = _id.toString()
      const expectedResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      }
      jest.spyOn(service, 'remove').mockImplementation(async () => await expectedResult)
      const response = await controller.remove(id, res)
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(response.json).toHaveBeenCalledWith(expectedResult)
    })

    it('should throw HttpException with BAD_REQUEST status when an error occurs', async () => {
      const id = _id.toString()
      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Something went wrong'))

      try {
        await controller.remove(id, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.getStatus()).toBe(400)
        expect(error.getResponse()).toBe('Something went wrong')
      }
    })
  })
})
