import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { meRoutes } from "./routes/me.js";

const PORT = Number(process.env.PORT ?? 4000);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: WEB_ORIGIN,
    credentials: true,
  });

  await app.register(cookie);

  app.get("/health", async () => ({ ok: true, service: "prs-api" }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(meRoutes, { prefix: "/api/me" });
  await app.register(adminRoutes, { prefix: "/api/admin" });

  await app.listen({ port: PORT, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
