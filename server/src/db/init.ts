import mongoose from "mongoose";

/** Atlas and most cloud MongoDB expect mongodb+srv:// + TLS, not mongodb://host:27017. */
function resolveMongoUri(): string {
  const raw = (process.env.MONGODB_URI || process.env.DATABASE_URL || "").trim();

  if (raw.startsWith("mongodb://") || raw.startsWith("mongodb+srv://")) {
    return raw;
  }

  const user = process.env.DATABASE_USER;
  const pass = process.env.DATABASE_PASS;
  const dbName = process.env.DATABASE_NAME;
  const host = raw;

  if (
    process.env.NODE_ENV === "production" &&
    user &&
    pass !== undefined &&
    host &&
    dbName
  ) {
    const u = encodeURIComponent(user);
    const p = encodeURIComponent(pass);
    return `mongodb+srv://${u}:${p}@${host}/${dbName}?retryWrites=true&w=majority`;
  }

  return raw;
}

export function initDatabase() {
  if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
  }

  const databaseURL = resolveMongoUri();

  mongoose.connection.once("open", () => {
    console.info("successfully connected to database");
  });

  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
  const connection = mongoose.connect(databaseURL);
  return connection;
}
