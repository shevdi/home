import mongoose from "mongoose";

export function initDatabase() {
  if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
  }

  const DATABASE_URL = process.env.DATABASE_URL || ''
  const DATABASE_USER = process.env.DATABASE_USER
  const DATABASE_PASS = process.env.DATABASE_PASS
  const DATABASE_NAME = process.env.DATABASE_NAME
  const databaseURL = process.env.NODE_ENV === 'production'
    ? `mongodb://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_URL}:27017/${DATABASE_NAME}`
    : DATABASE_URL

  mongoose.connection.once("open", () => {
    console.info("successfully connected to database:", DATABASE_URL);
  });

  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
  const connection = mongoose.connect(databaseURL);
  return connection;
}
