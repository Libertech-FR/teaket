import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Filestorage, FilestorageSchema } from './_schemas/filestorage.schema'
import { FilestorageService } from './filestorage.service'
import { FilestorageController } from './filestorage.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Filestorage.name,
        useFactory: () => FilestorageSchema,
      },
    ]),
  ],
  providers: [FilestorageService],
  controllers: [FilestorageController],
  exports: [FilestorageService],
})
export class FilestorageModule {
}
