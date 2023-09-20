import { fastify } from "fastify";
import { promptRoutes } from "./routes/prompts.route";
import { videoRoutes } from "./routes/videos.route";

const app = fastify();

app.register(promptRoutes, { prefix: "/prompts" });
app.register(videoRoutes, { prefix: "/videos" });

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Http server running!");
  });
