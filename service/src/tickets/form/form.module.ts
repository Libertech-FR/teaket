import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FormSchema, Form } from './_schemas/form.schema'
import { FormService } from './form.service'
import { FormController } from './form.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Form.name,
        useFactory: () => FormSchema,
      },
    ]),
  ],
  providers: [FormService],
  controllers: [FormController],
})
export class FormModule {}
