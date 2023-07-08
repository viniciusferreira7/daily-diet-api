import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return reply.status(200).send('Requisição realizada com sucesso')
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().nonempty(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    return reply.status(201).send()
  })
}
