import { DeleteResult } from 'mongodb'
import { Test, TestingModule } from '@nestjs/testing'
import { TicketService } from './ticket.service'
import { getModelToken } from '@nestjs/mongoose'
import { Ticket } from './schemas/ticket.schema'
import { Model, Types } from 'mongoose'

describe('TicketService', () => {
  let service: TicketService
  let model: Model<Ticket>
  const _id = new Types.ObjectId()
  const date = new Date()
  const mockTicket: Ticket = {
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
        TicketService,
        {
          provide: getModelToken(Ticket.name),
          useValue: Model,
        },
      ],
    }).compile()
    service = module.get<TicketService>(TicketService)
    model = module.get<Model<Ticket>>(getModelToken(Ticket.name))
  })

  describe('create', () => {
    it('should create a new record', async () => {
      const createTest = {}
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockTicket))
      const result = await service.create(createTest)
      expect(result).toEqual(mockTicket)
    })
  })

  describe('search', () => {
    it('should return an array of records and total count', async () => {
      const expected = [mockTicket]
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
    it('should return a Ticket record by ID', async () => {
      const expected = mockTicket
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read(_id.toString())
      expect(result).toEqual(expected)
    })

    it('should return null if Ticket record is not found', async () => {
      const expected = null
      jest.spyOn(model, 'findById').mockResolvedValueOnce(expected)
      const result = await service.read('123')
      expect(result).toEqual(expected)
    })
  })

  describe('update', () => {
    it('should update a Ticket record by ID with metadata', async () => {
      const ticketDto = { info: { key: 'updated value' } }
      const newObject = { ...mockTicket }
      const expected = newObject.info.push(ticketDto.info)
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(expected)
      const result = await service.update(_id.toString(), ticketDto)
      expect(result).toEqual(expected)
    })
  })

  describe('remove', () => {
    it('should remove a Ticket record by ID', async () => {
      const id = '123'
      const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 }
      jest.spyOn(model, 'deleteOne').mockResolvedValueOnce(deleteResult)
      const result = await service.remove(id)
      expect(result).toEqual(deleteResult)
    })
  })
})
