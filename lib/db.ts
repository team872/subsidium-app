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

// Villes pour géolocaliser les idées de démo (réparties sur la France).
const DEMO_CITIES: [number, number, string][] = [
  [45.757, 4.832, "Lyon"], [43.604, 1.444, "Toulouse"], [48.857, 2.352, "Paris"],
  [43.296, 5.369, "Marseille"], [44.838, -0.579, "Bordeaux"], [47.218, -1.554, "Nantes"],
  [50.629, 3.057, "Lille"], [48.583, 7.745, "Strasbourg"],
];

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
    -- Pièces jointes du débat (images / PDF), stockées en base (bytea)
    CREATE TABLE IF NOT EXISTS attachments (
      id SERIAL PRIMARY KEY,
      comment_id INT REFERENCES comments(id) ON DELETE CASCADE,
      filename TEXT, mime TEXT, size INT, data BYTEA,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    -- Notifications in-app (ex. nouvelle participation sur une idée suivie)
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      type TEXT, idea_id INT, comment_id INT,
      actor TEXT, message TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read);
    ALTER TABLE ideas ADD COLUMN IF NOT EXISTS location TEXT;
    -- Géolocalisation des idées (vue carte)
    ALTER TABLE ideas ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
    ALTER TABLE ideas ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION;

    -- Progression du parcours (source de vérité du niveau de maturité 0..4)
    ALTER TABLE users ADD COLUMN IF NOT EXISTS niveau INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS charte_validee BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS paye BOOLEAN DEFAULT FALSE;
    -- Backfill (idempotent) : les membres ayant déjà un palier d'auto-éval (hors Visiteur)
    -- sont au moins Refondateur (1), Initiateur (2) s'ils ont le badge N2.
    UPDATE users SET niveau = CASE WHEN badge_n2 THEN 2 ELSE 1 END
      WHERE niveau = 0 AND palier IS NOT NULL AND palier <> 'Visiteur';
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

  // Backfill géoloc (idempotent) : assigne des coordonnées démo aux idées sans lat,
  // réparties sur plusieurs villes françaises, avec un léger décalage pour ne pas superposer.
  const miss = await p.query<{ id: number }>(`SELECT id FROM ideas WHERE lat IS NULL ORDER BY id`);
  for (let i = 0; i < miss.rows.length; i++) {
    const c = DEMO_CITIES[i % DEMO_CITIES.length];
    const lat = c[0] + (Math.random() - 0.5) * 0.06;
    const lon = c[1] + (Math.random() - 0.5) * 0.06;
    await p.query(`UPDATE ideas SET lat=$2, lon=$3, location=COALESCE(location,$4) WHERE id=$1`, [miss.rows[i].id, lat, lon, c[2]]);
  }
}
