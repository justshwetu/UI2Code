import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGO_URI;
  const name = process.env.MONGO_DB || "ui2code";

  if (!uri) {
    throw new Error("MONGO_URI is not set in .env.local");
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(name);
    await ensureIndexes(db);
  }
  return db as Db;
}

async function ensureIndexes(database: Db) {
  await database.collection("users").createIndex({ email: 1 }, { unique: true });
  await database.collection("pending_signups").createIndex({ email: 1 }, { unique: true });
  await database.collection("pending_signups").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database.collection("pending_logins").createIndex({ email: 1 }, { unique: true });
  await database.collection("pending_logins").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database.collection("sessions").createIndex({ token: 1 }, { unique: true });
}

export function usersCol(database: Db): Collection {
  return database.collection("users");
}

export function pendingSignupsCol(database: Db): Collection {
  return database.collection("pending_signups");
}

export function pendingLoginsCol(database: Db): Collection {
  return database.collection("pending_logins");
}

export function sessionsCol(database: Db): Collection {
  return database.collection("sessions");
}
