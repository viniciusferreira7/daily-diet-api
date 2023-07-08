import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return reply.status(200).send('Requisição realizada com sucesso')
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().nonempty(),
    })

    const user = createUserBodySchema.safeParse(request.body)

    if (!user.success) {
      return reply.status(400).send({
        message: user.error.format(),
      })
    }

    const { name } = user.data

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      })

      await knex('users').insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
      })

      return reply.status(201).send()
    }

    return reply.status(401).send({
      message: 'You already have a user registered',
    })
  })
}
