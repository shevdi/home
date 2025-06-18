import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.ts";
import { initDatabase } from "./db/init.ts";

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.info(`Express server running on http://localhost:${PORT}`);
      console.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
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
