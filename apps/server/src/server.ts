import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia, type InferContext, t } from "elysia";
import { autoload } from "elysia-autoload";
import { oauth2 } from "elysia-oauth2";
import { config } from "~/src/config.ts";
import { userMiddleware } from "./middlewares/auth-middleware";

export const app = new Elysia({
	cookie: {
		domain: config.COOKIE_DOMAIN,
		secure: config.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
	},
})
	.use(logger())
	.use(
		swagger({
			path: "/docs",
			documentation: {
				info: {
					title: "dromi.app",
					version: "1.0.0",
				},
			},
			scalarConfig: {
				theme: "deepSpace",
				defaultHttpClient: {
					targetKey: "node",
					clientKey: "axios",
				},
			},
		}),
	)
	// .use(oauth2({}))
	.use(
		cors({
			credentials: true,
			origin:
				config.NODE_ENV === "production"
					? ["https://dromi.app", "https://web.dromi.app"]
					: ["http://localhost:3001", "http://localhost:3002"],
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	// .use(jwt({ secret: config.JWT_SECRET }))
	.derive(userMiddleware)
	.use(serverTiming())
	.use(await autoload());

export type ElysiaApp = typeof app;

export type ServerContext = InferContext<ElysiaApp>;
