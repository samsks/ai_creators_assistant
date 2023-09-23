import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";

/**
 * Registers the prompt routes to the Fastify instance.
 * @param {FastifyInstance} app - The Fastify instance to register the routes to.
 * @returns {Promise<void>} A promise that resolves when the routes are registered.
 */
export async function promptRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET / - Retrieves all prompts.
   * @param {FastifyRequest} request - The request object.
   * @param {FastifyReply} reply - The reply object.
   * @returns {Promise<FastifyReply>} An array of prompts.
   */
  app.get(
    "/",
    async (
      _request: FastifyRequest,
      reply: FastifyReply
    ): Promise<FastifyReply> => {
      const result = await prisma.prompt.findMany();

      return reply.send(result);
    }
  );
}
