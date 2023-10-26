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
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { FragmentPart } from '~/tickets/thread/_schemas/parts/fragment.part.schema'
import { FragmentType } from '~/tickets/thread/_enum/fragment-type.enum'
import { FragmentPartDto } from '~/tickets/thread/_dto/parts/fragment.part.dto'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { IdfsPart } from '~/_common/schemas/parts/idfs.part.schema'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'

@ApiTags('tickets')
@Controller('thread')
export class ThreadController extends AbstractController {
  protected static readonly projection: PartialProjectionType<ThreadDto> = {
    ticketId: 1,
    fragments: 1,
    metadata: 1,
    attachments: 1,
    type: 1,
    mailinfo: 1,
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
    const [data, total] = await this._service.findAndCount<Thread>(searchFilterSchema, ThreadController.projection, searchFilterOptions)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      total,
      data: data.map((thread) => {
        return {
          ...thread.toObject(),
          attachments: thread.attachments.map((attach: IdfsPart) => {
            const attachment: IdfsPartDto & { link?: string } = { ...attach.toObject() }
            attachment.link = '/' + ['core', 'filestorage', attach.id, 'raw'].join('/') + '?' + [`signature=empty`].join('&')
            return attachment
          }),
          fragments: thread.fragments.map((frag: FragmentPart) => {
            const fragment: FragmentPartDto & { filestorage?: { link?: string } } = { ...frag.toObject() }
            if (frag.disposition === FragmentType.FILE && frag.filestorage) {
              fragment.filestorage.link = '/' + ['core', 'filestorage', frag.filestorage.id, 'raw'].join('/') + '?' + [`signature=empty`].join('&')
            }
            return fragment
          }),
        }
      }),
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
