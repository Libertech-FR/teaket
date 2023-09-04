import { DefaultSession } from '@auth/core/types'

declare module "@auth/core/types" {
  interface Session {
    user?: DefaultSession['user'] & User & {
      id: string
    }
  }
  interface User {
    id: string
  }
}

export {}
