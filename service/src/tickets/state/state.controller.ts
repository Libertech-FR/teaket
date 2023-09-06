import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common'
import { StateService } from './state.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { Response } from 'express'
import { FilterOptions, FilterSchema, SearchFilterOptions, SearchFilterSchema } from '@streamkits/nestjs_module_scrud'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { ObjectIdValidationPipe } from '~/_common/pipes/object-id-validation.pipe'
import { Types } from 'mongoose'
import { StatesCreateDto, StatesDto, StatesUpdateDto } from '~/tickets/state/_dto/state.dto'
import { PartialProjectionType } from '~/_common/types/partial-projection.type'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'

@ApiTags('tickets')
@Controller('state')
export class StateController extends AbstractController {
  protected static readonly projection: PartialProjectionType<StatesDto> = {
    name: 1,
    color: 1,
    icon: 1,
  }

  public constructor(private readonly _service: StateService) {
    super()
  }

  @Post()
  @ApiCreateDecorator(StatesCreateDto, StatesDto)
  public async create(@Res() res: Response, @Body() body: StatesCreateDto): Promise<Response> {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(StatesDto, StateController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, StateController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(StatesDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiUpdateDecorator(StatesUpdateDto, StatesDto)
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: StatesUpdateDto, @Res() res: Response): Promise<Response> {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiDeletedResponseDecorator(StatesDto)
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
