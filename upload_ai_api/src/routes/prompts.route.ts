import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

/**
 * Registers the prompt routes to the Fastify instance.
 * @param app - The Fastify instance to register the routes to.
 */
export async function promptRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    return await prisma.prompt.findMany();
  });
}
