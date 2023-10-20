import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Entity } from '~/core/entities/_schemas/entities.schema'
import { Model, ModifyResult, Query } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { EmailAddress } from 'mailparser'
import { MetadataPart } from '~/_common/abstracts/schemas/parts/metadata.part.schema'
import { EntitiesCreateDto, EntitiesDto } from '~/core/entities/_dto/entites.dto'
import { EntityType } from '~/_common/enum/entity-type.enum'
// import { ModuleRef, REQUEST } from '@nestjs/core'
// import { Request } from 'express'

@Injectable({
  /*scope: Scope.REQUEST*/
})
export class EntitiesService extends AbstractServiceSchema {
  public constructor(
    // protected readonly moduleRef: ModuleRef,
    @InjectModel(Entity.name) protected _model: Model<Entity>, // @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({
      /*moduleRef, request*/
    })
  }

  // eslint-disable-next-line
  public async findOrCreateFromEmail<T extends Entity>(rfc822: EmailAddress): Promise<ModifyResult<Query<T, T, any, T>> & Entity> {
    return this._model.findOneAndUpdate(
      <EntitiesDto>{
        publicEmail: rfc822.address,
      },
      {
        $setOnInsert: <EntitiesCreateDto>{
          publicEmail: rfc822.address,
          type: EntityType.OTHER,
          profile: {
            commonName:
              rfc822.name ||
              rfc822.address
                .split('@')
                .map((part, index) => {
                  if (index === 0) {
                    return part.charAt(0).toUpperCase() + part.slice(1)
                  }
                  const domain = part.split('.')[0]
                  return domain.charAt(0).toUpperCase() + domain.slice(1)
                })
                .join(' '),
          },
        },
        $set: {
          metadata: <MetadataPart>{
            lastUpdatedAt: new Date(),
            lastUpdatedBy: 'console',
          },
        },
      },
      {
        upsert: true,
        new: true,
      },
    )
  }
}
