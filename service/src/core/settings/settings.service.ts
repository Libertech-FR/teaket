import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Setting } from '~/core/settings/_schemas/setting.schema'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { ConfigService } from '@nestjs/config'
import { SettingFor } from '~/core/settings/_enum/setting-for.enum'
import { IdentityType } from '~/_common/types/identity.type'
import { set } from 'radash'
import { MixedValue } from '~/_common/types/mixed-value.type'

@Injectable()
export class SettingsService extends AbstractService {
  public constructor(
    protected readonly config: ConfigService,
    @InjectModel(Setting.name) protected _model: Model<Setting>,
  ) {
    super()
  }

  public async settings(forType: SettingFor[], identity: IdentityType): Promise<any> {
    const settingsBase = this.config.get<MixedValue>(`settings`)
    const filters = [{ for: SettingFor.ALL, scope: null }]
    forType.forEach((type) => {
      switch (type) {
        case SettingFor.USER: {
          filters.push({ for: type, scope: identity._id.toString() })
          break
        }
        case SettingFor.ROLE: {
          for (const role of identity.roles) {
            filters.push({ for: type, scope: role })
          }
        }
      }
    })
    const settings = await this._model.find(
      { $or: filters },
      { key: 1, value: 1, _id: 0 },
      { sort: { for: 1, scope: 1 } },
    )

    for (const setting of settings) {
      set(settingsBase as object, setting.key, setting.value)
    }
    return settingsBase
  }

  protected setting<T>(name: string): T | MixedValue {
    return this.config.get<MixedValue>(`settings.${name}`)
  }

  public async get<T>(name: string): Promise<T | MixedValue> {
    const setting = await this._model.findOne({ name })
    if (setting) return setting.value
    return this.setting<T>(name)
  }

  public async set<T>(
    key: string,
    value: T | MixedValue,
    options?: { for: SettingFor, scope: string },
  ): Promise<T | MixedValue> {
    const updated = await this._model.findOneAndUpdate(
      { key },
      { $set: { value, ...options } },
      { upsert: true, new: true },
    )
    return updated.value
  }
}
