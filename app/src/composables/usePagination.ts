import type { QTableProps } from 'quasar'
import { useRoute, useRouter } from 'nuxt/app'
import { LocationQueryValue } from 'vue-router'

export default function usePagination() {
  const route = useRoute()
  const router = useRouter()
  const defaultSortBy = 'metadata.lastUpdatedAt'
  const defaultDescending = true
  const pagination = ref<QTableProps['pagination']>({
    rowsNumber: 0,
    page: 1,
    rowsPerPage: 10,
    sortBy: 'metadata.lastUpdatedAt',
    descending: true,
  })

  function initializePagination(total: number = 0) {
    if (!pagination.value) return
    const query = { ...route.query }
    const limit = query.limit ?? 10
    const skip = query.skip ?? 0
    pagination.value.rowsPerPage = parseInt(limit as string)
    pagination.value.page = parseInt(skip as string) / parseInt(limit as string) + 1
    pagination.value.rowsNumber = total

    setSortOptions(query)
    paginationQuery()
  }

  function setSortOptions(query: { [x: string]: LocationQueryValue | LocationQueryValue[] }) {
    if (!pagination.value) return
    for (const key in query) {
      if (key.startsWith('sort')) {
        const sortKey = key.replace('sort[', '').replace(']', '')
        const sortDirection = query[key] === 'desc' ? 'desc' : 'asc'
        pagination.value.sortBy = sortKey
        pagination.value.descending = sortDirection === 'desc'
      }
    }
  }

  async function onRequest(props: QTableProps, total: number) {
    if (!pagination.value) return
    if (!props.pagination) return
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    pagination.value.rowsNumber = total
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    paginationQuery()
  }

  function paginationQuery() {
    if (!pagination.value) return
    if (!pagination.value.page || !pagination.value.rowsPerPage) return
    const query = removeSortKey()
    const skip = `${(pagination.value.page - 1) * pagination.value.rowsPerPage}`
    const limit = `${pagination.value.rowsPerPage}`
    let sortKey = `sort[${defaultSortBy}]`
    let sortDirection = defaultDescending ? 'desc' : 'asc'
    if (pagination.value.sortBy) {
      sortKey = `sort[${pagination.value.sortBy}]`
      sortDirection = pagination.value.descending ? 'desc' : 'asc'
    }

    query[sortKey] = sortDirection
    query['skip'] = skip
    query['limit'] = limit

    router.push({
      query,
    })
  }

  function removeSortKey() {
    const query = { ...route.query }
    for (const key in query) {
      if (key.startsWith('sort[')) {
        delete query[key]
      }
    }
    return query
  }

  return { pagination, onRequest, paginationQuery, initializePagination }
}
