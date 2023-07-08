import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExits } from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })

      const meal = createMealBodySchema.safeParse(request.body)

      if (!meal.success) {
        return reply.status(400).send({
          message: meal.error.format(),
        })
      }

      const { name, isDiet, description } = meal.data

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_diet: isDiet,
      })

      return reply.status(201).send()
    },
  )
}
