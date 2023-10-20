export enum SettingFor {
  ALL = 0,
  ROLE = 25,
  USER = 99,
}

export const SettingForList: number[] = Object.keys(SettingFor)
  // eslint-disable-next-line
  .filter((k) => typeof SettingFor[k as any] === 'number')
  // eslint-disable-next-line
  .map((k) => parseInt(SettingFor[k as any], 10))
