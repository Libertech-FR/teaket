import { useRouter, useRoute } from 'nuxt/app'
export async function pushQuery(payload: { value: any; key: string; multiple?: boolean }) {
  const route = useRoute()
  const router = useRouter()
  const { value, key, multiple } = payload
  const query = { ...route.query }
  if (!multiple) {
    query[key] = value
  } else {
    const keyWithBrackets = `${key}[]`
    const multiplefilters = (query[key] as string[]) || []
    const soloFilter = (query[keyWithBrackets] as string[]) || []
    const filters = [...multiplefilters, ...soloFilter]

    const keysToDelete = new Set<string>()

    for (const queryKey in query) {
      if (queryKey.startsWith(key)) {
        keysToDelete.add(queryKey)
      }
    }

    keysToDelete.forEach((keyToDelete) => {
      delete query[keyToDelete]
    })

    if (filters.includes(value.toString())) {
      const index = filters.indexOf(value.toString())
      filters.splice(index, 1)
    } else {
      filters.push(value.toString())
    }
    const length = filters.length
    console.log(length)
    if (length === 1) {
      query[keyWithBrackets] = filters
    } else {
      if (query[keyWithBrackets]) {
        delete query[keyWithBrackets]
      }
      query[key] = filters
    }
  }
  console.log('query', query)
  await router.push({
    query,
  })
}