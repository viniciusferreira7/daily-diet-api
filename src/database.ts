import { Knex } from 'knex'

export const config: Knex.Config = {
  client: 'slqlite3',
  connection: {
    filename: 'sqlite',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}
