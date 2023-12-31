import { fastify } from "fastify";
import { promptRoutes } from "./routes/prompts.route";
import { videoRoutes } from "./routes/videos.route";
import { aiRoutes } from "./routes/ai.route";
import { fastifyCors } from "@fastify/cors";

const app = fastify();
app.register(fastifyCors, {
  origin: "*",
});

app.register(promptRoutes, { prefix: "/prompts" });
app.register(videoRoutes, { prefix: "/videos" });
app.register(aiRoutes, { prefix: "/ai" });

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Http server running!");
  });
