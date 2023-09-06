import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common'
import { CategoriesCreateDto, CategoriesDto, CategoriesUpdateDto } from './_dto/categories.dto'
import { CategoriesService } from './categories.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import {
  FilterOptions,
  FilterSchema,
  ObjectIdValidationPipe,
  SearchFilterOptions,
  SearchFilterSchema,
} from '@streamkits/nestjs_module_scrud'
import { Types } from 'mongoose'
import { Response } from 'express'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { PartialProjectionType } from '~/_common/types/partial-projection.type'

@ApiTags('core')
@Controller('categories')
export class CategoriesController extends AbstractController {

  protected static readonly projection: PartialProjectionType<CategoriesDto> = {
    name: 1,
    parentId: 1,
    color: 1,
    icon: 1,
    disabled: 1,
  }

  constructor(private readonly _service: CategoriesService) {
    super()
  }

  @Post()
  @ApiCreateDecorator(CategoriesCreateDto, CategoriesDto)
  public async create(@Res() res: Response, @Body() body: CategoriesCreateDto): Promise<Response> {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(CategoriesDto, CategoriesController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    //TODO: search tree by parentId
    const [data, total] = await this._service.findAndCount(searchFilterSchema, CategoriesController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(CategoriesDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiUpdateDecorator(CategoriesUpdateDto, CategoriesDto)
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: CategoriesUpdateDto, @Res() res: Response): Promise<Response> {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiDeletedResponseDecorator(CategoriesDto)
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
