import { Pool } from "pg";
import { IDEAS, EVENTS } from "./feed";

// Pool PostgreSQL partagé (DATABASE_URL fourni par l'environnement du conteneur).
let pool: Pool | null = null;
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

// Initialisation idempotente : crée le schéma et amorce les données si la base est vide.
let ready: Promise<void> | null = null;
export function ensureDb(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}

async function init(): Promise<void> {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nom TEXT, prenom TEXT, situation TEXT, ville TEXT, pays TEXT,
      palier TEXT, score INT, badge_n2 BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS ideas (
      id SERIAL PRIMARY KEY,
      cat TEXT, color TEXT, title TEXT NOT NULL, descr TEXT,
      author TEXT, author_id INT REFERENCES users(id) ON DELETE SET NULL,
      status TEXT, base_messages INT DEFAULT 0, date_label TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      tag TEXT, title TEXT NOT NULL, descr TEXT, day TEXT, month TEXT, grad TEXT
    );
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      idea_id INT REFERENCES ideas(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      author TEXT, body TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS follows (
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      idea_id INT REFERENCES ideas(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, idea_id)
    );
    ALTER TABLE ideas ADD COLUMN IF NOT EXISTS location TEXT;
  `);

  const { rows } = await p.query(`SELECT COUNT(*)::int AS n FROM ideas`);
  if (rows[0].n === 0) {
    for (const it of IDEAS) {
      await p.query(
        `INSERT INTO ideas (cat,color,title,descr,author,status,base_messages,date_label)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [it.cat, it.color, it.title, it.desc, it.author, it.status ?? null, it.messages, it.date]
      );
    }
    for (const ev of EVENTS) {
      await p.query(
        `INSERT INTO events (tag,title,descr,day,month,grad) VALUES ($1,$2,$3,$4,$5,$6)`,
        [ev.tag, ev.title, ev.desc, ev.day, ev.month, ev.grad]
      );
    }
  }
}
