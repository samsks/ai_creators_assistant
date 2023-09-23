import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs, { createReadStream } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { openai } from "../lib/openai";

const pump = promisify(pipeline);

/**
 * Registers the video routes to the Fastify instance.
 * @param {FastifyInstance} app - The Fastify instance.
 * @returns {Promise<void>} A promise that resolves when the routes are registered.
 */
export async function videoRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Registers fastify-multipart plugin to the Fastify instance.
   * @param {Object} limits - The limits for the plugin.
   * @param {number} limits.fileSize - The maximum file size allowed in bytes.
   */
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25 MB
    },
  });

  /**
   * POST / - Uploads a video file and saves it to the server.
   * @param {FastifyRequest} request - The request object.
   * @param {FastifyReply} reply - The reply object.
   * @returns {Promise<FastifyReply>} - The video data object.
   */
  app.post(
    "/",
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<FastifyReply> => {
      /**
       * @typedef {Object} FileData
       * @property {string} filename - The name of the uploaded file.
       * @property {NodeJS.ReadableStream} file - The file stream.
       */
      const data = await request.file();

      if (!data)
        return reply.status(400).send({ error: "Missing file uploaded" });

      const extension = path.extname(data.filename);

      if (extension !== ".mp3")
        return reply
          .status(400)
          .send({ error: "Invalid file type, please upload a MP3." });

      const fileBaseName = path.basename(data.filename, extension);
      const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

      const uploadDestination = path.resolve(
        __dirname,
        "../../tmp",
        fileUploadName
      );

      await pump(data.file, fs.createWriteStream(uploadDestination));

      const videoData = await prisma.video.create({
        data: {
          name: data.filename,
          path: uploadDestination,
        },
      });

      return reply.status(201).send(videoData);
    }
  );

  /**
   * POST / - Transcribes a video file using OpenAI's API.
   * @param {FastifyRequest} request - The request object.
   * @param {FastifyReply} reply - The reply object.
   * @returns {Promise<FastifyReply>} - The transcription object.
   */
  app.post(
    "/:videoId/transcription",
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<FastifyReply> => {
      /**
       * @typedef {Object} Params
       * @property {string} videoId - The ID of the video to transcribe.
       */
      const paramsSchema = z.object({
        videoId: z.string().uuid(),
      });
      const { videoId } = paramsSchema.parse(request.params);

      /**
       * @typedef {Object} Body
       * @property {string} prompt - The prompt to use for the transcription.
       */
      const bodySchema = z.object({
        prompt: z.string(),
      });
      const { prompt } = bodySchema.parse(request.body);

      const video = await prisma.video.findUniqueOrThrow({
        where: { id: videoId },
      });

      const videoPath = video.path;
      const audioReadStream = createReadStream(videoPath);

      const response = await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: "whisper-1",
        language: "pt",
        response_format: "json",
        temperature: 0,
        prompt,
      });

      const transcription = response.text;

      await prisma.video.update({
        where: { id: videoId },
        data: {
          transcription,
        },
      });

      return reply.send({ transcription });
    }
  );
}
