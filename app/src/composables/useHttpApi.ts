// noinspection JSUnusedGlobalSymbols

// @ts-ignore
import { paths } from '@/../.nuxt/types/service-api'

import { Ref } from 'vue'
import { FetchError } from 'ofetch/dist/node'
import { AvailableRouterMethod, NitroFetchRequest } from 'nitropack'
import { AsyncData, FetchResult, UseFetchOptions } from 'nuxt/app'
import { KeysOf } from 'nuxt/dist/app/composables/asyncData'

export type MaybeRef2<T> = T | Ref<T>
export type MaybeRefOrGetter2<T> = MaybeRef2<T> | (() => T)

export type OkStatus = 200 | 201 | 202 | 203 | 204 | 206 | 207 | '2XX' | 'default'
export type ErrorStatus =
  500
  | '5XX'
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 420
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 429
  | 431
  | 444
  | 450
  | 451
  | 497
  | 498
  | 499
  | '4XX'
export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'

export interface Paths extends paths {
  [key: string]: any
}

type MediaTypes<T, Status extends keyof any> = {
  [S in Status]: T extends {
    responses: {
      [_ in S]: {
        content: {
          'application/json': infer Model
        }
      }
    }
  } ? Model : never
}[Status]
export type OpenApiResponse<T> = MediaTypes<T, OkStatus>
export type OpenApiError<T> = MediaTypes<T, ErrorStatus>

export type BodyType<ResT extends keyof Paths & string, Method extends HttpMethod> = Paths[ResT][Lowercase<Method>]['requestBody']['content']['application/json']
export type ResponseType<ResT extends keyof Paths & string, Method extends HttpMethod> = OpenApiResponse<Paths[ResT][Lowercase<Method>]>

export function useHttpApi<
  ResT extends keyof Paths & string,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends AvailableRouterMethod<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod<ReqT> ? 'get' : AvailableRouterMethod<ReqT> : AvailableRouterMethod<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = null
>(
  path: MaybeRefOrGetter2<ResT>,
  opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method> & {
    method: Method,
    body?: Paths[ResT][Lowercase<Method>]['requestBody']['content']['application/json'],
  },
): AsyncData<OpenApiResponse<Paths[ResT][Lowercase<Method>]> | undefined, FetchError<OpenApiError<Paths[ResT][Lowercase<Method>]>>> {
// ): Promise<AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | null>> {

  return useHttp(path, {
    baseURL: 'http://localhost:7100',
    ...opts,
  })
}
