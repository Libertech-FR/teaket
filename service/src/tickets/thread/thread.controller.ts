import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common'
import { ThreadService } from './thread.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { Response } from 'express'
import { FilterOptions, FilterSchema, SearchFilterOptions, SearchFilterSchema } from '@streamkits/nestjs_module_scrud'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { ObjectIdValidationPipe } from '~/_common/pipes/object-id-validation.pipe'
import { Types } from 'mongoose'
import { ThreadCreateDto, ThreadDto } from '~/tickets/thread/_dto/thread.dto'
import { PartialProjectionType } from '~/_common/types/partial-projection.type'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { StatesDto } from '~/tickets/state/_dto/state.dto'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'

@ApiTags('tickets')
@Controller('thread')
export class ThreadController extends AbstractController {
  protected static readonly projection: PartialProjectionType<ThreadDto> = {
    ticketId: 1,
  }

  public constructor(private readonly _service: ThreadService) {
    super()
  }

  @Post()
  @ApiCreateDecorator(ThreadCreateDto, ThreadDto)
  public async create(@Res() res: Response, @Body() body: ThreadCreateDto): Promise<Response> {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(ThreadDto, ThreadController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, ThreadController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(ThreadDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
