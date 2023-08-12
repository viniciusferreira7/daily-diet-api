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
    '/summary/total',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('*')

      return reply.status(200).send({
        message: {
          total: meals.length,
        },
      })
    },
  )
  app.get(
    '/summary/is-diet',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const isDiet = !!1

      const meals = await knex('meals')
        .where({
          session_id: sessionId,
          is_diet: isDiet,
        })
        .select('*')

      return reply.status(200).send({
        message: {
          meals,
          total: meals.length,
        },
      })
    },
  )
  app.get(
    '/summary/off-diet',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const isDiet = !!0

      const meals = await knex('meals')
        .where({
          session_id: sessionId,
          is_diet: isDiet,
        })
        .select('*')

      return reply.status(200).send({
        message: {
          meals,
          total: meals.length,
        },
      })
    },
  )
  app.get(
    '/summary/sequence-in-diet',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const meals = await knex('meals')
        .where({
          session_id: sessionId,
        })
        .select('*')

      const sequenceInNumbers: number[] = []

      meals.forEach((meal) => {
        sequenceInNumbers.push(Number(meal.is_diet))
      })

      const summedSequences: number[] = []

      sequenceInNumbers.reduce((accumulator, currentValue) => {
        const sum = accumulator + currentValue
        if (!currentValue) {
          summedSequences.push(sum)
          return 0
        }
        summedSequences.push(accumulator + currentValue)
        return accumulator + currentValue
      }, 0)

      const sortFromLargestToSmallestNumber = summedSequences.sort(
        (currentNumber, nextNumber) => (currentNumber > nextNumber ? -1 : 0),
      )

      const theBestSequence = sortFromLargestToSmallestNumber[0]

      return reply.status(200).send({
        message: {
          sequence: theBestSequence,
        },
      })
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const sessionId = request.cookies.sessionId

      const meal = await knex('meals')
        .where({
          session_id: sessionId,
          id,
        })
        .select('*')

      return {
        meal,
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

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const deleteMealSchema = z.object({
        id: z.string(),
      })

      const meal = deleteMealSchema.safeParse(request.params)

      if (!meal.success) {
        return reply.status(400).send({
          message: meal.error.format(),
        })
      }

      const { id } = meal.data

      await knex('meals').where('id', id).delete('*')

      return reply.status(204).send()
    },
  )
}
