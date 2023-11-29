type AutocompleteFilter = {
    field: string
    value: string
    operator: string
}

type FilterOption = {
    label: string
    value?: string
    group?: string
    header?: boolean
    icon?: string
    color?: string
  }

export { AutocompleteFilter, FilterOption }