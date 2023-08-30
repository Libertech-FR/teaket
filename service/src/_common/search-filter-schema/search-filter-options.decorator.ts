import { ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

export const DEFAULT_SEARCH_OPTIONS = {
  loggerType: 'FilterOptionsControl',
  defaultLimit: 10,
  limitKey: 'limit',
  skipKey: 'skip',
  pageKey: 'page',
}

export interface FilterSearchOptions {
  loggerType?: string
  defaultLimit?: number
  limitKey?: string
  skipKey?: string
  pageKey?: string
}

export interface FilterOptions {
  limit: number
  skip: number
}

/* istanbul ignore next */
export const SearchFilterOptions = createParamDecorator((options: FilterSearchOptions, ctx: ExecutionContext): FilterOptions => {
  options = { ...DEFAULT_SEARCH_OPTIONS, ...options }
  const req = ctx.switchToHttp().getRequest<Request>()
  const limit = parseInt(`${req.query[options.limitKey]}`, 10) || options.defaultLimit
  let skip = parseInt(`${req.query[options.skipKey]}`, 10) || 0
  if (req.query[options.pageKey]) {
    if (skip > 0) Logger.debug(`Both ${options.skipKey} and ${options.pageKey} are set. ${options.skipKey} will be ignored`, options.loggerType)
    skip = (parseInt(`${req.query[options.pageKey]}`, 10) - 1) * limit
  }
  return {
    limit,
    skip,
  }
})