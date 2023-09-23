import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { streamToResponse, OpenAIStream } from "ai";
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";

/**
 * Registers AI routes on the provided Fastify instance.
 * @param {FastifyInstance} app - The Fastify instance.
 * @returns {Promise<void>} A promise that resolves when the routes are registered.
 */
export async function aiRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST / - Handles the POST request to complete the AI model.
   * @param {FastifyRequest} request - The Fastify request object.
   * @param {FastifyReply} reply - The Fastify reply object.
   * @returns {Promise<FastifyReply>} The response from the AI model.
   */
  app.post(
    "/complete",
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      /**
       * The expected request body schema.
       */
      const bodySchema = z.object({
        videoId: z.string().uuid(),
        template: z.string(),
        temperature: z.number().min(0).max(1).default(0.5),
      });

      const { videoId, template, temperature } = bodySchema.parse(request.body);

      /**
       * The video object retrieved from the database.
       */
      const video = await prisma.video.findUniqueOrThrow({
        where: { id: videoId },
      });

      if (!video.transcription)
        return reply
          .status(400)
          .send({ error: "Video transcription was not generated yet." });

      /**
       * The message to be sent to the AI model.
       */
      const promptMessage = template.replace(
        "{transcription}",
        video.transcription
      );

      /**
       * The response from the AI model.
       */
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        temperature,
        messages: [
          {
            role: "user",
            content: promptMessage,
          },
        ],
        stream: true,
      });

      const stream = OpenAIStream(response);

      streamToResponse(stream, reply.raw, {
        headers: {
          "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS", // Required for CORS support to work
        },
      });
    }
  );
}
