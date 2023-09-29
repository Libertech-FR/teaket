import { IsString, IsNumberString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class MailsWebhookDto {
  @IsString()
  @ApiProperty()
  public account: string

  @IsNumberString()
  @ApiProperty()
  public seq: string

  @IsString()
  @ApiProperty()
  public uid: string

  @IsString()
  @ApiProperty()
  public id: string
}
