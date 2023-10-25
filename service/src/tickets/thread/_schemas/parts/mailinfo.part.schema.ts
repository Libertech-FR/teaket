import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { IdfsPart, IdfsPartSchema } from '~/_common/schemas/parts/idfs.part.schema'
import { MailaddressPart, MailaddressPartSchema } from '~/_common/schemas/parts/mailaddress.part.schema'

@Schema({ _id: false })
export class MailinfoPart extends Document {
  @Prop({
    type: String,
    required: true,
  })
  public account: string

  @Prop({ type: String })
  public subject?: string

  @Prop({
    type: MailaddressPartSchema,
    default: {},
  })
  public from: MailaddressPart

  @Prop({
    type: [MailaddressPartSchema],
    default: [],
  })
  public to?: MailaddressPart[]

  @Prop({
    type: [MailaddressPartSchema],
    default: [],
  })
  public cc?: MailaddressPart[]

  /**
   * @description TheadType=INCOMING ONLY !
   */
  @Prop({
    type: String,
  })
  public messageId?: string

  /**
   * @description TheadType=INCOMING ONLY !
   */
  @Prop({
    type: IdfsPartSchema,
  })
  public filestorage?: IdfsPart
}

export const MailinfoPartSchema = SchemaFactory.createForClass(MailinfoPart)
