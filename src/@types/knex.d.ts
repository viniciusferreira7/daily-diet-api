// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
      created_at: string
    }
    meals: {
      id: string
      session_id: string
      name: string
      description: string
      is_diet: boolean
      created_at: string
    }
  }
}
