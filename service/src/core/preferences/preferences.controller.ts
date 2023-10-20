import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res } from '@nestjs/common'
import { PreferencesCreateDto, PreferencesDto, PreferencesUpdateDto } from './_dto/preferences.dto'
import { PreferencesService } from './preferences.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { SearchFilterSchema, FilterSchema, SearchFilterOptions, FilterOptions, ObjectIdValidationPipe } from '@streamkits/nestjs_module_scrud'
import { Types } from 'mongoose'
import { Request, Response } from 'express'
import { PartialProjectionType } from '~/_common/types/partial-projection.type'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'

@ApiTags('core')
@Controller('preferences')
export class PreferencesController extends AbstractController {
  public static readonly projection: PartialProjectionType<PreferencesDto> = {
    name: 1,
    entityId: 1,
  }

  public constructor(private readonly _service: PreferencesService) {
    super()
  }

  @Post()
  @ApiCreateDecorator(PreferencesCreateDto, PreferencesDto)
  public async create(@Res() res: Response, @Body() body: PreferencesCreateDto): Promise<Response> {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(PreferencesDto, PreferencesController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, PreferencesController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(PreferencesDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiUpdateDecorator(PreferencesUpdateDto, PreferencesDto)
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: PreferencesUpdateDto, @Res() res: Response): Promise<Response> {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiDeletedResponseDecorator(PreferencesDto)
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
