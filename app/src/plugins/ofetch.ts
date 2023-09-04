import { useAuth } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const {  token, data, status, lastRefreshedAt } = useAuth()
  // console.log('token', token)
  // console.log('data', data)
  // console.log('status', status)
  // console.log('lastRefreshedAt', lastRefreshedAt)
  const instance = $fetch.create({
    baseURL: '/api',
    headers: {
      Accept: 'application/json',
      Authorization: `${token.value}`,
    },
  })

  globalThis.$fetch = instance

  return {
    provide: {
      fetch: instance
    }
  }
})
