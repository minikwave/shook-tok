import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true, service: "shook-tok-api" }));

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    console.log(`API listening on ${host}:${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
