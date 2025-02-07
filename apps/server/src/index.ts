import { config } from "~/src/config.ts";
import { prisma } from "~/src/lib/db.ts";
import { app } from "~/src/server.ts";
const signals = ["SIGINT", "SIGTERM"];

for (const signal of signals) {
	process.on(signal, async () => {
		console.log(`Received ${signal}. Initiating graceful shutdown...`);
		await app.stop();
		process.exit(0);
	});
}

process.on("uncaughtException", (error) => {
	console.error(error);
});

process.on("unhandledRejection", (error) => {
	console.error(error);
});

await prisma.$connect();
console.log("🗄️ Database was connected!");

app.listen(config.PORT, () =>
	console.log(`🦊 Server started at ${app.server?.url.origin}`),
);
