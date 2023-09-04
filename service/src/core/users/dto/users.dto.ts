import { PartialType } from '@nestjs/swagger'

export class UsersCreateDto {

}

export class UsersUpdateDto extends PartialType(UsersCreateDto) {
}
