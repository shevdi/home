import mongoose from "mongoose";

export function initDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017';
  mongoose.connection.once("open", () => {
    console.info("successfully connected to database:", DATABASE_URL);
  });

  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
  const connection = mongoose.connect(DATABASE_URL);
  return connection;
}
