import { Type } from '@nestjs/common'
import { PickType } from '@nestjs/swagger'

export function PickProjectionHelper<T, K extends keyof T>(
  classRef: Type<T>,
  projection: {
    [key in keyof T]?: number | 1 | 0
  },
): Type<Pick<T, (readonly K[])[number]>> {
  //TODO: error in PickType to openapi
  const keys = Object.keys(projection).filter((key) => projection[key] === 1)
  return PickType(classRef, keys as K[])
}
