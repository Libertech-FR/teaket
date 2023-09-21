export enum SettingFor {
  ALL = 0,
  ROLE = 25,
  USER = 99,
}

export const SettingForList: number[] = Object.keys(SettingFor)
  .filter((k) => typeof SettingFor[k as any] === 'number')
  .map((k) => parseInt(SettingFor[k as any], 10))
