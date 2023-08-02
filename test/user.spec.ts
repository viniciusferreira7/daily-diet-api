import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it.todo('Should be able create to a new user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        name: 'Vinicius',
      })
      .expect(201)
  })

  it('Should be able get a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/user')
      .send({
        name: 'Vinicius',
      })
      .expect(201)
    const cookies = createUserResponse.get('Set-Cookie')
    const listUserResponse = await request(app.server)
      .get('/user')
      .set('Cookie', cookies)

    expect(listUserResponse.body.user).toEqual([
      expect.objectContaining({ name: 'Vinicius' }),
    ])
  })
})
