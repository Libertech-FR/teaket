import { BadRequestException, ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import dayjs from 'dayjs'
import merge from 'deepmerge'
import { Request } from 'express'
import { ParsedQs } from 'qs'

export const DEFAULT_ALLOWED_FILTERS = ['=', '?', '#', '!', '>', '<', '^', '@']
export const DEFAULT_SCHEMA_OPTIONS = {
  loggerType: 'FilterSchemaControl',
  unsafe: false,
  queryKey: 'filters',
  strict: true,
}

export interface FilterSchemaOptions {
  loggerType?: string
  dayjsLocale?: string
  unsafe?: boolean
  queryKey?: string
  strict?: boolean
}

export interface FilterSchema {
  [key: string]: FilterSchema
}

/* istanbul ignore next */
export const SearchFilterSchema = createParamDecorator((options: FilterSchemaOptions, ctx: ExecutionContext): FilterSchema => {
  options = { ...DEFAULT_SCHEMA_OPTIONS, ...options }
  const req = ctx.switchToHttp().getRequest<Request>()
  try {
  return filterSchema(req.query[options.queryKey], options)
  } catch (error) {
    throw new BadRequestException(error.message)
  }
})

export function filterSchema(
  filters: string | string[] | ParsedQs | ParsedQs[],
  options?: FilterSchemaOptions,
): FilterSchema {
  options = { ...DEFAULT_SCHEMA_OPTIONS, ...options }
  let conditions = {}
  if (typeof filters === 'object') {
    for (const key of Object.keys(filters)) {
      const data = filters[key]
      switch (key) {
        case '$or':
        case '$and': {
          for (const k of key) {
            const d = filters[key][k]
            conditions = merge(conditions, internalFilterbyType(k, d, DEFAULT_ALLOWED_FILTERS, options))
          }
          break
        }

        default: {
          conditions = merge(conditions, internalFilterbyType(key, data, DEFAULT_ALLOWED_FILTERS, options))
          break
        }
      }
    }
  }
  return conditions
}

function internalFilterbyType(
  key: string,
  data: string,
  allowed: string[] = DEFAULT_ALLOWED_FILTERS,
  options: FilterSchemaOptions = DEFAULT_SCHEMA_OPTIONS,
) {
  const parsed = {}
  const keyCheck = key.replace(new RegExp(`[${allowed.join('')}]`, 'g'), '')
  if (keyCheck.length === 0 || (!allowed.includes(key[0]) && !/[a-zA-Z0-9-_]/.test(key[0]))) return {}
  switch (key[0]) {
    case '?': {
      parsed[key.slice(1)] = /true|on|yes|1/i.test(data)
      break
    }

    case '#': {
      const valueHashtag = Number(data)
      if (isNaN(valueHashtag)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with number: ${data}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with number: ${data}`, options.loggerType)
        break
      }
      parsed[key.slice(1)] = valueHashtag
      break
    }

    case '!': {
      const valueExclamation = internalFilterbyType(key.slice(1), data, ['#', '@'])
      if (Object.keys(valueExclamation).length === 0) break
      const typeExclamation = Object.keys(valueExclamation[keyCheck])[0]
      if (typeExclamation === '$in') {
        parsed[keyCheck] = { $nin: valueExclamation[keyCheck]['$in'] }
        break
      }
      parsed[keyCheck] = { $ne: valueExclamation[keyCheck] }
      break
    }

    case '<':
    case '>': {
      let upperLowerType = key[0] === '>' ? '$gt' : '$lt'
      if (key[1] === '=') upperLowerType = `${upperLowerType}e`
      const upperLowerKey = key.slice(upperLowerType.length - 2)
      const valueGreater = internalFiltersByTypeUpperLower(upperLowerType, upperLowerKey, data, options)
      if (Object.keys(valueGreater).length === 0) break
      const subKeyGreater = Object.keys(valueGreater)[0]
      // parsed[subKeyGreater] = { ...parsed[subKeyGreater], ...valueGreater[subKeyGreater] }
      parsed[subKeyGreater] = valueGreater[subKeyGreater]
      break
    }

    case '^': {
      const re = data.trim().split('/')
      if (re[0] !== '' || re.length < 3) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with regex: ${data}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with regex: ${data}`, options.loggerType)
        break
      }
      re.shift()
      const $options = re.pop()
      parsed[key.slice(1)] = { $regex: re.join('') }
      if ($options) parsed[key.slice(1)]['$options'] = $options
      break
    }

    case '@': {
      let subKeyAt
      const $in = []
      if (!Array.isArray(data)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with bad array: ${data}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with bad array: ${data}`, options.loggerType)
        break
      }
      for (const d of data) {
        const valueAt = internalFilterbyType(key.slice(1), d, ['#'])
        if (Object.keys(valueAt).length === 0) break
        subKeyAt = Object.keys(valueAt)[0]
        $in.push(valueAt[subKeyAt])
      }
      if (!subKeyAt) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with array: ${JSON.stringify(data)}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with array: ${JSON.stringify(data)}`, options.loggerType)
        break
      }
      parsed[subKeyAt] = { $in }
      break
    }

    case '=': {
      if (Array.isArray(data)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with strict array: ${JSON.stringify(data)}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with strict string: ${JSON.stringify(data)}`, options.loggerType)
        break
      }
      parsed[key.slice(1)] = `${data}`
      break
    }

    default: {
      if (!options.unsafe && Array.isArray(data)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with unsafe: ${JSON.stringify(data)}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with unsafe: ${JSON.stringify(data)}`, options.loggerType)
        break
      }
      parsed[key] = data
      break
    }
  }
  return parsed
}

function internalFiltersByTypeUpperLower(
  type: string,
  key: string,
  data: string,
  options?: FilterSchemaOptions,
): FilterSchema {
  const parsed = {}
  if (key[0] !== '#') {
    const dayjsDate = dayjs(data, options.dayjsLocale)
    if (!dayjsDate.isValid() || dayjsDate.toDate().toString() === 'Invalid Date') {
      if (options.strict) throw new Error(`Invalid filter key ${key} with date: ${data}`)
      Logger.verbose(`Invalid filter key ${key} with date: ${data}`, options.loggerType)
      return {}
    }
    parsed[key] = {}
    parsed[key][type] = dayjsDate.toDate()
    return parsed
  }
  const value = internalFilterbyType(key, data, ['#'])
  if (Object.keys(value).length === 0) return {}
  const subKey = Object.keys(value)[0]
  parsed[subKey] = {}
  parsed[subKey][type] = {}
  parsed[subKey][type] = value[subKey]
  return parsed
}