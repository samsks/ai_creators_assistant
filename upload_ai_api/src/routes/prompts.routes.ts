import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function promptRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    return await prisma.prompt.findMany();
  });
}
