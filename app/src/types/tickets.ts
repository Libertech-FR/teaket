interface Filter {
  label: string
  field: string
  comparator: string
  querySign: string
  search: string
}

interface Field {
  name: string
  label: string
  type: string
}

interface Comparator {
  label: string
  querySign: string
  value: string
  icon: string
  type: string[]
  multiplefields: boolean
  prefix: string
  suffix: string
}

interface SearchFilter {
  field: Field
  comparator: Comparator
  search: string
  searchMin: string
  searchMax: string
}

interface Option {
  label: string
  value?: string
  group?: string
  header?: boolean
}
export { Filter, Field, Comparator, SearchFilter, Option }
