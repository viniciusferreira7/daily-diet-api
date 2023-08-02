import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import request from 'supertest'
import { execSync } from 'child_process'
import { app } from '../src/app'

describe('Meal routes', () => {
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

  it('should be able create to a meal', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .set('Cookie', cookies)
      .send({
        name: 'Almoço',
        description: 'Arroz e feijão',
        isDiet: 'true',
      })
      .expect(201)
  })
})
