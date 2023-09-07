import { Type } from '@nestjs/common'

// noinspection JSUnusedLocalSymbols
export function PickProjectionHelper<T, K extends keyof T>(
  classRef: Type<T>,
  _projection: {
    [key in keyof T]?: number | 1 | 0
  },
): Type<T> {
  //TODO: fix to use projection with pick or partial
  return classRef
}
