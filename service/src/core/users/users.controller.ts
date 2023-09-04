import { Controller } from '@nestjs/common'
import { UsersService } from './users.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'

@Controller('users')
export class UsersController extends AbstractController {
  constructor(private readonly service: UsersService) {
    super()
  }
}
