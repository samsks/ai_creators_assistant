import { FastifyInstance } from "fastify";
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

export async function videoRoutes(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25 MB
    },
  });

  app.post("/", async (request, reply) => {
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
  });

  app.post("/:videoId/transcript", async (request, reply) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    });
    const { videoId } = paramsSchema.parse(request.params);

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

    return { transcription };
  });
}
