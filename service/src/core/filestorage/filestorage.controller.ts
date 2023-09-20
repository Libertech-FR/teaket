import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FilestorageCreateDto, FilestorageDto, FilestorageUpdateDto } from './_dto/filestorage.dto'
import { FilestorageService } from './filestorage.service'
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
import { PartialProjectionType } from '~/_common/types/partial-projection.type'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'
import { PickProjectionHelper } from '~/_common/helpers/pick-projection.helper'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'
import { Public } from '~/_common/decorators/public.decorator'
import { FileInterceptor } from '@nestjs/platform-express'

@Public()
@ApiTags('core')
@Controller('filestorage')
export class FilestorageController extends AbstractController {
  protected static readonly projection: PartialProjectionType<FilestorageDto> = {
    type: 1,
    namespace: 1,
    path: 1,
    hidden: 1,
  }

  public constructor(private readonly _service: FilestorageService) {
    super()
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiCreateDecorator(FilestorageCreateDto, FilestorageDto)
  public async create(
    @Res() res: Response,
    @Body() body: FilestorageCreateDto,
    @UploadedFile(
      new ParseFilePipe({ fileIsRequired: false }),
    ) file?: Express.Multer.File,
  ): Promise<Response> {
    const data = await this._service.create({ ...body, file })
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get()
  @ApiPaginatedDecorator(PickProjectionHelper(FilestorageDto, FilestorageController.projection))
  public async search(@Res() res: Response, @SearchFilterSchema() searchFilterSchema: FilterSchema, @SearchFilterOptions() searchFilterOptions: FilterOptions): Promise<Response> {
    const [data, total] = await this._service.findAndCount(searchFilterSchema, FilestorageController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(FilestorageDto)
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Get(':_id([0-9a-fA-F]{24})/raw')
  @ApiParam({ name: '_id', type: String })
  @ApiReadResponseDecorator(FilestorageDto)
  public async readRawData(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<void> {
    const [data, stream] = await this._service.findByIdWithRawData(_id)
    res.setHeader('Content-Type', data.mime || 'application/octet-stream')
    stream.pipe(res)
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiUpdateDecorator(FilestorageUpdateDto, FilestorageDto)
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: FilestorageUpdateDto, @Res() res: Response): Promise<Response> {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  @ApiDeletedResponseDecorator(FilestorageDto)
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response): Promise<Response> {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
