import type { ElysiaApp } from "~/src/server.ts";

export default (app: ElysiaApp) =>
	app.get("/", () => {
		return {
			success: true,
			message: "Hello World",
		};
	});
