import { fastify } from "fastify";
import { promptRoutes } from "./routes/prompts.routes";

const app = fastify();

app.register(promptRoutes, { prefix: "/prompts" });

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Http server running!");
  });
