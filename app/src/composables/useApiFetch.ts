import { AllPaths, HttpMethod, IgnoreCase, OpenApiError, OpenApiResponse } from 'nuxt-api-party/dist/runtime/types'
import { MaybeRefOrGetter } from 'nuxt-api-party/dist/runtime/utils'
import { paths as Paths } from '#nuxt-api-party/api'
import { UseOpenApiDataOptions } from 'nuxt-api-party/dist/runtime/composables/useApiData'
import { AsyncData } from 'nuxt/app'
import { FetchError } from 'ofetch'

// export function useApiFetch<P extends GETPlainPaths<Paths>>(
//   path: MaybeRefOrGetter<P>,
//   opts?: Omit<UseOpenApiDataOptions<Paths[`/${P}`]>, 'method'>,
// ): AsyncData<OpenApiResponse<Paths[`/${P}`]['get']> | undefined, FetchError<OpenApiError<Paths[`/${P}`]['get']>>> {
//   return useApiData(path, {
//     ...opts,
//     cache: false,
//     client: true,
//   } as any)
// }

//TODO: fix this

// export const useApiFetch = useApiData

export function useApiFetch<P extends AllPaths<Paths>, M extends IgnoreCase<keyof Paths[`/${P}`] & HttpMethod>>(
  path: MaybeRefOrGetter<P>,
  opts?: Omit<UseOpenApiDataOptions<Paths[`/${P}`], M>, 'method'> & {
    method: M;
  } & {
    /* @ts-ignore */
    body: Paths[`/${P}`][Lowercase<M>]['requestBody']['content']['application/json'],
  },
  // opts?: UseOpenApiDataOptions<Paths[`/${P}`], M> & {
  //   method: M;
  // },
  /* @ts-ignore */
  body?: Paths[`/${P}`][Lowercase<M>]['requestBody']['content']['application/json'],
): /* @ts-ignore */
  AsyncData<OpenApiResponse<Paths[`/${P}`][Lowercase<M>]> | undefined, FetchError<OpenApiError<Paths[`/${P}`][Lowercase<M>]>>> {
  if(!body){
    return useApiData(path, {
      ...opts,
      cache: false,
      client: true,
    } as any)
  } 
  return useApiData(path, {
    ...opts,
    cache: false,
    client: true,
    body: {
      ...opts?.body,
      ...body,
    }
  } as any)
}

