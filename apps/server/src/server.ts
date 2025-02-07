import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { type Context, Elysia } from "elysia";
import { autoload } from "elysia-autoload";
import { oauth2 } from "elysia-oauth2";
import { config } from "~/src/config.ts";

export const app = new Elysia()
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
	// .use(cors())
	// .use(jwt({ secret: config.JWT_SECRET }))
	.use(serverTiming())
	.use(await autoload());

export type ElysiaApp = typeof app;
