/* eslint-disable */
// noinspection JSUnusedGlobalSymbols

// @ts-ignore
import { paths } from '@/../.nuxt/types/service-api'

import { Ref } from 'vue'
import { FetchError } from 'ofetch/dist/node'
import { AvailableRouterMethod, NitroFetchRequest } from 'nitropack'
import { AsyncData, FetchResult, NuxtError, UseFetchOptions } from 'nuxt/app'
import { KeysOf } from 'nuxt/dist/app/composables/asyncData'
import { Notify } from 'quasar'

type MaybeRef2<T> = T | Ref<T>
type MaybeRefOrGetter2<T> = MaybeRef2<T> | (() => T)

type OkStatus = 200 | 201 | 202 | 203 | 204 | 206 | 207 | '2XX' | 'default'
type ErrorStatus =
  | 500
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
type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'

interface Paths extends paths {
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function resolvePath(path: MaybeRefOrGetter2<string>, params?: Record<string, MaybeRefOrGetter2<unknown>>) {
  // To simplify typings, OpenAPI path parameters can be expanded here
  if (params) {
    return Object.entries(params).reduce((path, [name, value]) => `${path}`.replace(`{${name}}`, encodeURIComponent(String(toValue(value)))), path)
  }

  return path
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MediaTypes<T, Status extends keyof any> = {
  [S in Status]: T extends {
    responses: {
      [_ in S]: {
        content: {
          'application/json': infer Model
        }
      }
    }
  }
    ? Model
    : never
}[Status]
type OpenApiResponse<T> = MediaTypes<T, OkStatus>
type OpenApiError<T> = MediaTypes<T, ErrorStatus>

type BodyType<ResT extends keyof Paths & string, Method extends HttpMethod> = Paths[ResT][Lowercase<Method>]['requestBody']['content']['application/json']
type ResponseType<ResT extends keyof Paths & string, Method extends HttpMethod> = OpenApiResponse<Paths[ResT][Lowercase<Method>]>
const $q = useQuasar()

export async function useHttpApi<
  ResT extends keyof Paths & string,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends AvailableRouterMethod<ReqT> = ResT extends void ? ('get' extends AvailableRouterMethod<ReqT> ? 'get' : AvailableRouterMethod<ReqT>) : AvailableRouterMethod<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = null,
>(
  path: MaybeRefOrGetter2<ResT>,
  opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method> & {
    method: Method
    body?: Partial<Paths[ResT][Lowercase<Method>]['requestBody']['content']['application/json']>
    pathParams?: Record<string, any>
  },
  errorParams?: {
    silent?: boolean
    redirect?: boolean
    message?: string
    color?: string
  },
): Promise<AsyncData<OpenApiResponse<Paths[ResT][Lowercase<Method>]> | undefined, FetchError<OpenApiError<Paths[ResT][Lowercase<Method>]>>> | NuxtError> {
  // ): Promise<AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | null>> {
  const response = await useHttp(resolvePath(path, opts?.pathParams), {
    baseURL: 'http://localhost:7100',
    ...opts,
  })
  if (response.error.value) {
    console.log(response.error.value)
    if (errorParams?.redirect) {
      return showError({ statusCode: response.error.value.statusCode, statusMessage: response.error.value.statusMessage })
    }
    if (!errorParams?.silent) {
      Notify.create({
        message: errorParams?.message ?? 'Une erreur est survenue',
        type: errorParams?.color ?? 'negative',
      })
    }
  }

  return response
}
