import 'dotenv/config'

import { app } from "./app.ts";
import { initDatabase } from "./db/init.ts";
import { logError } from "./db/services/logs";

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.PORT) || 3001;

async function startServer(): Promise<void> {
  try {
    await initDatabase();

    // Bind 0.0.0.0 so Amvera / Docker ingress can reach the process (not only localhost).
    app.listen(port, "0.0.0.0", () => {
      console.info(`Express listening on 0.0.0.0:${port}`);
      console.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    logError(err, { source: 'startServer', action: 'initDatabase' })
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
