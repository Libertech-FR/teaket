import { Connection, Model, Schema } from 'mongoose'
import { AutoIncrementPluginOptions, AutoIncrementPluginTrackerSpec } from './auto-increment.interface'
import { logger } from './auto-increment.logger'

const DEFAULT_INCREMENT = 1

const IDSchema = new Schema<AutoIncrementPluginTrackerSpec>(
  {
    field: String,
    modelName: String,
    count: Number,
  },
  { versionKey: false },
)
IDSchema.index({ field: 1, modelName: 1 }, { unique: true })

export const AutoIncrementIDSkipSymbol = Symbol('AutoIncrementIDSkip')

export function isNullOrUndefined(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

// eslint-disable-next-line
export function AutoIncrementPlugin(schema: Schema<any>, options: any): void {
  const opt: Required<AutoIncrementPluginOptions> = {
    field: '_id',
    incrementBy: DEFAULT_INCREMENT,
    trackerCollection: 'identitycounters',
    trackerModelName: 'identitycounter',
    startAt: 0,
    overwriteModelName: '',
    ...options,
  }

  let model: Model<AutoIncrementPluginTrackerSpec>

  logger.info('AutoIncrementID called with options %O', opt)

  schema.pre('save', async function (next): Promise<void> {
    logger.info('AutoIncrementID PreSave')

    // eslint-disable-next-line
    const originalModelName: string = (this.constructor as any).modelName
    let modelName: string

    if (typeof opt.overwriteModelName === 'function') {
      // eslint-disable-next-line
      modelName = opt.overwriteModelName(originalModelName, this.constructor as any)

      if (!modelName || typeof modelName !== 'string') {
        throw new Error('"overwriteModelname" is a function, but did return a falsy type or is not a string!')
      }
    } else {
      modelName = opt.overwriteModelName || originalModelName
    }

    if (!model) {
      logger.info('Creating idtracker model named "%s"', opt.trackerModelName)
      // needs to be done, otherwise "undefiend" error if the plugin is used in an sub-document
      // eslint-disable-next-line
      const db: Connection = this.db ?? (this as any).ownerDocument().db
      model = db.model<AutoIncrementPluginTrackerSpec>(opt.trackerModelName, IDSchema, opt.trackerCollection)
      // test if the counter document already exists
      const counter = await model
        .findOne({
          modelName: modelName,
          field: opt.field,
        })
        .lean()
        .exec()

      if (!counter) {
        await model.create({
          modelName: modelName,
          field: opt.field,
          count: opt.startAt - opt.incrementBy,
        })
      }
    }

    if (!this.isNew) {
      logger.info('Document is not new, not incrementing')

      return
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof this[AutoIncrementIDSkipSymbol] === 'boolean' && AutoIncrementIDSkipSymbol) {
      logger.info('Symbol "AutoIncrementIDSkipSymbol" is set to "true", skipping')

      return
    }

    const leandoc = await model
      .findOneAndUpdate(
        {
          field: opt.field,
          modelName: modelName,
        },
        {
          $inc: { count: opt.incrementBy },
        },
        {
          new: true,
          fields: { count: 1, _id: 0 },
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean()
      .exec()

    if (isNullOrUndefined(leandoc)) {
      throw new Error(`"findOneAndUpdate" incrementing count failed for "${modelName}" on field "${opt.field}"`)
    }

    logger.info('Setting "%s" to "%d"', opt.field, leandoc.count)
    this[opt.field] = leandoc.count

    return next()
  })
}
