import { Knex } from 'knex'
import { env } from './env'

const envConnection =
  env.DATABASE_CLIENT === 'sqlite'
    ? {
        filename: env.DATABASE_URL,
      }
    : env.DATABASE_URL

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: envConnection,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}
