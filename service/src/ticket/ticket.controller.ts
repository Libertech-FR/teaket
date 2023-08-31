import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res } from '@nestjs/common'
import { TicketService } from './ticket.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { TicketCreateDto, TicketUpdateDto } from './_dto/ticket.dto'
import { Request, Response } from 'express'
import { ObjectIdValidationPipe } from '~/_common/pipes/object-id-validation.pipe'
import { Types } from 'mongoose'
import { FilterOptions, SearchFilterOptions } from '~/_common/search-filter-schema/search-filter-options.decorator'
import { FilterSchema, SearchFilterSchema } from '~/_common/search-filter-schema/search-filter-schema.decorator'

@Controller('ticket')
export class TicketController extends AbstractController {
  protected readonly projection = {
    subject: 1,
    sequence: 1,
    envelope: 1,
  }

  public constructor(private readonly _service: TicketService) {
    super()
  }

  @Post()
  public async create(@Req() req: Request, @Res() res: Response, @Body() body: TicketCreateDto) {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions) {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, this.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response) {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: TicketUpdateDto, @Res() res: Response) {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response) {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
