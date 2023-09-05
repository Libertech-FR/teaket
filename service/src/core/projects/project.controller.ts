import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res } from '@nestjs/common'
import { ProjectCreateDto, ProjectUpdateDto } from './_dto/project.dto'
import { ProjectService } from './project.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { SearchFilterSchema, FilterSchema, SearchFilterOptions, FilterOptions, ObjectIdValidationPipe } from '@streamkits/nestjs_module_scrud'
import { Types } from 'mongoose'
import { Request, Response } from 'express'

@ApiTags('core')
@Controller('project')
export class ProjectController extends AbstractController {
  protected readonly projection = {
    name: 1,
    startDate: 1,
    endDate: 1,
    description: 1,
  }

  constructor(private readonly _service: ProjectService) {
    super()
  }

  @Post()
  public async create(@Req() req: Request, @Res() res: Response, @Body() body: ProjectCreateDto) {
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
  @ApiParam({ name: '_id', type: String })
  public async read(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response) {
    const data = await this._service.findById(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  public async update(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Body() body: ProjectUpdateDto, @Res() res: Response) {
    const data = await this._service.update(_id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':_id([0-9a-fA-F]{24})')
  @ApiParam({ name: '_id', type: String })
  public async remove(@Param('_id', ObjectIdValidationPipe) _id: Types.ObjectId, @Res() res: Response) {
    const data = await this._service.delete(_id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
