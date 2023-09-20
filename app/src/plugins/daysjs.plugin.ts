import { defineNuxtPlugin } from "#app/nuxt";
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

export default defineNuxtPlugin(() => {
  const dayjs = useDayjs()
  dayjs.extend(timezone)
  dayjs.extend(relativeTime)
})
