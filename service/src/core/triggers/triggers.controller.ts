import { Controller, Post, Res, Body, HttpStatus, Get, Param, Patch, Delete } from '@nestjs/common'
import { ApiTags, ApiParam } from '@nestjs/swagger'
import { AbstractController, SearchFilterSchema, FilterSchema, SearchFilterOptions, FilterOptions, ObjectIdValidationPipe } from '@streamkits/nestjs_module_scrud'
import { Types } from 'mongoose'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { PartialProjectionType } from '~/_common/types/partial-projection.type'
import { TriggersDto, TriggersCreateDto, TriggersUpdateDto } from './_dto/triggers.dto'
import { TriggersService } from './triggers.service'
import { Response } from 'express'

@ApiTags('core')
@Controller('triggers')
export class TriggersController extends AbstractController {
  protected static readonly projection: PartialProjectionType<TriggersDto> = {
    name: 1,
    description: 1,
  }

  constructor(private readonly _service: TriggersService) {
    super()
  }

  @Post()
  @ApiCreateDecorator(TriggersCreateDto, TriggersDto)
  public async create(@Res() res: Response, @Body() body: TriggersCreateDto): Promise<Response> {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(TriggersDto, TriggersController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, TriggersController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(TriggersDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiUpdateDecorator(TriggersUpdateDto, TriggersDto)
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: TriggersUpdateDto, @Res() res: Response): Promise<Response> {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiDeletedResponseDecorator(TriggersDto)
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
