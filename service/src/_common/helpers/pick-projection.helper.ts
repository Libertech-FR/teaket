import { Type } from '@nestjs/common'
import { PickType } from '@nestjs/swagger'

export function PickProjectionHelper<T, K extends keyof T>(
  classRef: Type<T>,
  // classRef: any,
  projection: {
    [key in keyof T]?: number | 1 | 0
  },
): Type<Pick<T, any>> {
// ): Type<Pick<T, (readonly K[])[number]>> {
  const keys = Object.keys(projection)
    // .filter((key) => projection[key] === 1)
  return PickType(classRef, keys as K[])
}

// console.log(PickProjectionHelper({ a: number, b: 2, c: 3 }, { a: 1, b: 1 }))
