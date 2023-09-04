export type PartialProjectionType<T> = {
  [key in keyof T]?: number | 1 | 0
}
