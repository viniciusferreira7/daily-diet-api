import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExits } from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('*')

      return {
        meals,
      }
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string(),
      })

      const meal = getMealParamsSchema.parse(request.params)

      const { id } = meal
      const sessionId = request.cookies.sessionId

      const meals = await knex('meals')
        .where({
          session_id: sessionId,
          id,
        })
        .select('*')

      return {
        meals,
      }
    },
  )

  app.post(
    '/',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.string(),
      })

      const meal = createMealBodySchema.safeParse(request.body)

      if (!meal.success) {
        return reply.status(400).send({
          message: meal.error.format(),
        })
      }

      const sessionId = request.cookies.sessionId

      const { name, isDiet, description } = meal.data

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_diet: isDiet.toLowerCase() === 'true',
        session_id: sessionId,
      })
      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const putMealParamsSchema = z.object({
        id: z.string(),
      })

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.string(),
      })

      const updateMeal = updateMealBodySchema.safeParse(request.body)

      if (!updateMeal.success) {
        return reply.status(400).send({
          message: updateMeal.error.format(),
        })
      }

      const meal = putMealParamsSchema.parse(request.params)
      const { id } = meal
      const { name, isDiet, description } = updateMeal.data

      const data = await knex('meals')
        .where('id', id)
        .update({
          name,
          description,
          is_diet: isDiet.toLowerCase() === 'true',
          updated_at: new Date().toISOString(),
        })

      if (!data) {
        return reply.status(404).send()
      }
      return reply.status(204).send()
    },
  )
}
