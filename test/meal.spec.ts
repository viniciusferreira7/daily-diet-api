import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
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

  it.skip('should be able create to a meal', async () => {
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

  it.skip('should be able list meats', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    const listMealResponse = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Almoço',
        description: 'Arroz e feijão',
        is_diet: 1,
      }),
      expect.objectContaining({
        name: 'Janta',
        description: 'Arroz e Salada',
        is_diet: 1,
      }),
    ])
  })

  it.skip('should be able to get total meats', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    const totalMeals = await request(app.server)
      .get('/meal/summary/total')
      .set('Cookie', cookies)
      .expect(200)

    expect(totalMeals.body).toEqual(
      expect.objectContaining({
        message: { total: 2 },
      }),
    )
  })

  it.skip('should be able to get total meals within the diet', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Sobremesa',
      description: 'Chocolate',
      isDiet: 'false',
    })

    const totalMeals = await request(app.server)
      .get('/meal/summary/is-diet')
      .set('Cookie', cookies)
      .expect(200)

    expect(totalMeals.body).toEqual(
      expect.objectContaining({
        message: {
          meals: [
            expect.objectContaining({
              name: 'Almoço',
              description: 'Arroz e feijão',
              is_diet: 1,
            }),
            expect.objectContaining({
              name: 'Janta',
              description: 'Arroz e Salada',
              is_diet: 1,
            }),
          ],
          total: 2,
        },
      }),
    )
  })

  it.skip('should be able to get total meals outside the diet', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Sobremesa',
      description: 'Chocolate',
      isDiet: 'false',
    })

    const totalMeals = await request(app.server)
      .get('/meal/summary/off-diet')
      .set('Cookie', cookies)
      .expect(200)

    expect(totalMeals.body).toEqual(
      expect.objectContaining({
        message: {
          meals: [
            expect.objectContaining({
              name: 'Sobremesa',
              description: 'Chocolate',
              is_diet: 0,
            }),
          ],
          total: 1,
        },
      }),
    )
  })

  it.skip('should be able to get best sequence of meals within the diet', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Sobremesa',
      description: 'Chocolate',
      isDiet: 'false',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Lanche',
      description: 'Laranja',
      isDiet: 'true',
    })

    const totalMeals = await request(app.server)
      .get('/meal/summary/sequence-in-diet')
      .set('Cookie', cookies)
      .expect(200)

    expect(totalMeals.body).toEqual(
      expect.objectContaining({
        message: {
          sequence: 2,
        },
      }),
    )
  })

  it.skip('should be able to get specific meal', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Sobremesa',
      description: 'Chocolate',
      isDiet: 'false',
    })

    const listMealResponse = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    const theLastMeal = listMealResponse.body.meals[2]

    const meal = await request(app.server)
      .get(`/meal/${theLastMeal.id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(meal.body).toEqual(
      expect.objectContaining({
        meal: expect.objectContaining({
          name: 'Sobremesa',
          description: 'Chocolate',
          is_diet: 0,
        }),
      }),
    )
  })

  it.skip('should be able delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'Vinicius',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Almoço',
      description: 'Arroz e feijão',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Janta',
      description: 'Arroz e Salada',
      isDiet: 'true',
    })

    await request(app.server).post('/meal').set('Cookie', cookies).send({
      name: 'Sobremesa',
      description: 'Chocolate',
      isDiet: 'false',
    })

    const listMealResponse = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    const theLastMeal = listMealResponse.body.meals[2]

    await request(app.server)
      .delete(`/meal/${theLastMeal.id}`)
      .set('Cookie', cookies)
      .expect(204)
  })
})
// TODO: Remove skip from tests
