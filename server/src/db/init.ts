import mongoose from "mongoose";

function resolveMongoUri(): string {
  const DATABASE_URL = process.env.DATABASE_URL || ""
  const isFullUri =
    DATABASE_URL.startsWith("mongodb://") || DATABASE_URL.startsWith("mongodb+srv://")

  // Docker / typical env: full URI (e.g. mongodb://home-database:27017/home)
  if (isFullUri) {
    return DATABASE_URL
  }

  // Legacy: hostname in DATABASE_URL + credentials in separate vars
  const DATABASE_USER = process.env.DATABASE_USER
  const DATABASE_PASS = process.env.DATABASE_PASS
  const DATABASE_NAME = process.env.DATABASE_NAME
  if (
    process.env.NODE_ENV === "production" &&
    DATABASE_USER &&
    DATABASE_PASS &&
    DATABASE_NAME &&
    DATABASE_URL
  ) {
    return `mongodb://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_URL}:27017/${DATABASE_NAME}`
  }

  return DATABASE_URL || "mongodb://127.0.0.1:27017/home"
}

export function initDatabase() {
  if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
  }

  const DATABASE_URL = process.env.DATABASE_URL || ""
  const databaseURL = resolveMongoUri()

  mongoose.connection.once("open", () => {
    console.info("successfully connected to database:", DATABASE_URL || databaseURL);
  });

  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
  const connection = mongoose.connect(databaseURL);
  return connection;
}
