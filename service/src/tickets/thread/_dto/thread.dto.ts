import { PartialType } from '@nestjs/swagger'

export class ThreadCreateDto {

}

export class ThreadUpdateDto extends PartialType(ThreadCreateDto) {
}
