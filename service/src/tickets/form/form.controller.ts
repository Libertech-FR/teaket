import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common'
import { FormDto, FormUpdateDto } from './_dto/form.dto'
import { FormService } from './form.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SearchFilterSchema, FilterSchema, SearchFilterOptions, FilterOptions, ObjectIdValidationPipe } from '@streamkits/nestjs_module_scrud'
import { Types } from 'mongoose'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { PartialProjectionType } from '~/_common/types/partial-projection.type'
import { Response } from 'express'

@ApiTags('forms')
@Controller('form')
export class FormController extends AbstractController {
  protected static readonly projection: PartialProjectionType<FormDto> = {
    title: 1,
    description: 1,
    type: 1,
    sections: 1,
    submitButtonText: 1,
  }
  constructor(private readonly _service: FormService) {
    super()
  }
  @Post()
  @ApiCreateDecorator(FormDto, FormDto)
  @ApiResponse({ type: FormDto })
  public async create(@Res() res: Response, @Body() body: FormDto) {
    const data = await this._service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(FormDto, FormController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, FormController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(FormDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response) {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiUpdateDecorator(FormUpdateDto, FormDto)
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: FormUpdateDto, @Res() res: Response) {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiDeletedResponseDecorator(FormDto)
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response) {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
