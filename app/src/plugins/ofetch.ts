export default defineNuxtPlugin((nuxtApp) => {
  const instance = $fetch.create({
    baseURL: '/api',
    headers: {
      Accept: 'application/json',
      // Authorization: `${tokenStrategy?.token?.get()}`,
    },
  })

  globalThis.$fetch = instance

  return {
    provide: {
      fetch: instance,
    },
  }
})
