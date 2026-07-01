import { Pool } from 'pg';

// Interface definitions
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  briefing_opt_in: boolean;
  briefing_time: string;
  created_at: Date;
}

export interface UserDashboard {
  user_id: number;
  selected_areas: string[];
  data: Record<string, any>;
  updated_at: Date;
}

// Global variable to cache the database client / fallback
let dbPool: Pool | null = null;
let isPostgres = false;

// Check if Postgres database URL is available
const dbUrl = process.env.DATABASE_URL;

if (dbUrl && dbUrl !== 'postgresql://user:password@host/dbname?sslmode=require') {
  try {
    dbPool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false } // Required for Neon Postgres
    });
    isPostgres = true;
    console.log('[DATABASE] Using Neon Postgres Database.');
  } catch (err) {
    console.error('[DATABASE] Error initializing Postgres pool, falling back to local JSON file:', err);
    isPostgres = false;
  }
} else {
  console.warn('[DATABASE] DATABASE_URL is missing or default. Using local JSON file db_fallback.json for persistence.');
  isPostgres = false;
}

// Helpers for JSON Fallback Database — DISABLED on Vercel (read-only filesystem).
// These now throw a clear error instead of silently failing with EROFS.
function readFallbackDb(): { users: any[]; user_dashboards: any[] } {
  throw new Error(
    'Database is not connected. DATABASE_URL is missing or invalid — check your Vercel environment variables and make sure it matches your real Neon connection string.'
  );
}

function writeFallbackDb(_data: { users: any[]; user_dashboards: any[] }) {
  throw new Error(
    'Database is not connected. DATABASE_URL is missing or invalid — check your Vercel environment variables and make sure it matches your real Neon connection string.'
  );
}

// Initialize database schema (runs at startup or when client is first used)
export async function initDb() {
  if (isPostgres && dbPool) {
    try {
      const client = await dbPool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            phone VARCHAR(50),
            briefing_opt_in BOOLEAN DEFAULT FALSE,
            briefing_time VARCHAR(10) DEFAULT '07:00',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS user_dashboards (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            selected_areas JSONB NOT NULL,
            data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('[DATABASE] Postgres tables initialized successfully.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('[DATABASE] Postgres tables initialization failed, using fallback database:', err);
      isPostgres = false;
    }
  }

  if (!isPostgres) {
    console.error('[DATABASE] Running without a valid Postgres connection. Signups and data will fail until DATABASE_URL is set correctly.');
  }
}

// Database helper functions
export async function getUserByEmail(email: string): Promise<User | null> {
  await initDb();
  if (isPostgres && dbPool) {
    try {
      const res = await dbPool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      return res.rows[0] || null;
    } catch (err) {
      console.error('[DATABASE] Postgres getUserByEmail error:', err);
      // Fallback
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  await initDb();
  if (isPostgres && dbPool) {
    try {
      const res = await dbPool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch (err) {
      console.error('[DATABASE] Postgres getUserById error:', err);
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  const user = db.users.find(u => u.id === id);
  return user || null;
}

export async function createUser(userData: {
  email: string;
  passwordHash: string;
  name?: string;
  phone?: string;
  briefingOptIn?: boolean;
  briefingTime?: string;
}): Promise<User> {
  await initDb();
  const email = userData.email.toLowerCase();
  const name = userData.name || '';
  const phone = userData.phone || '';
  const briefingOptIn = userData.briefingOptIn ?? false;
  const briefingTime = userData.briefingTime || '07:00';

  if (isPostgres && dbPool) {
    try {
      const res = await dbPool.query(
        `INSERT INTO users (email, password_hash, name, phone, briefing_opt_in, briefing_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [email, userData.passwordHash, name, phone, briefingOptIn, briefingTime]
      );
      return res.rows[0];
    } catch (err) {
      console.error('[DATABASE] Postgres createUser error:', err);
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser: User = {
    id: newId,
    email,
    password_hash: userData.passwordHash,
    name,
    phone,
    briefing_opt_in: briefingOptIn,
    briefing_time: briefingTime,
    created_at: new Date()
  };
  db.users.push(newUser);
  writeFallbackDb(db);
  return newUser;
}

export async function updateUserBriefingSettings(
  id: number,
  phone: string,
  briefingOptIn: boolean,
  briefingTime: string
): Promise<boolean> {
  await initDb();
  if (isPostgres && dbPool) {
    try {
      await dbPool.query(
        `UPDATE users 
         SET phone = $1, briefing_opt_in = $2, briefing_time = $3 
         WHERE id = $4`,
        [phone, briefingOptIn, briefingTime, id]
      );
      return true;
    } catch (err) {
      console.error('[DATABASE] Postgres updateUserBriefingSettings error:', err);
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    db.users[userIndex].phone = phone;
    db.users[userIndex].briefing_opt_in = briefingOptIn;
    db.users[userIndex].briefing_time = briefingTime;
    writeFallbackDb(db);
    return true;
  }
  return false;
}

export async function getUserDashboard(userId: number): Promise<UserDashboard | null> {
  await initDb();
  if (isPostgres && dbPool) {
    try {
      const res = await dbPool.query('SELECT * FROM user_dashboards WHERE user_id = $1', [userId]);
      if (res.rows[0]) {
        return {
          user_id: res.rows[0].user_id,
          selected_areas: Array.isArray(res.rows[0].selected_areas) ? res.rows[0].selected_areas : JSON.parse(res.rows[0].selected_areas || '[]'),
          data: typeof res.rows[0].data === 'object' ? res.rows[0].data : JSON.parse(res.rows[0].data || '{}'),
          updated_at: res.rows[0].updated_at
        };
      }
      return null;
    } catch (err) {
      console.error('[DATABASE] Postgres getUserDashboard error:', err);
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  const dash = db.user_dashboards.find(d => d.user_id === userId);
  return dash ? { ...dash, updated_at: new Date(dash.updated_at) } : null;
}

export async function saveUserDashboard(
  userId: number,
  selectedAreas: string[],
  data: Record<string, any>
): Promise<UserDashboard> {
  await initDb();
  if (isPostgres && dbPool) {
    try {
      const res = await dbPool.query(
        `INSERT INTO user_dashboards (user_id, selected_areas, data, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET selected_areas = $2, data = $3, updated_at = NOW()
         RETURNING *`,
        [userId, JSON.stringify(selectedAreas), JSON.stringify(data)]
      );
      return {
        user_id: res.rows[0].user_id,
        selected_areas: Array.isArray(res.rows[0].selected_areas) ? res.rows[0].selected_areas : JSON.parse(res.rows[0].selected_areas || '[]'),
        data: typeof res.rows[0].data === 'object' ? res.rows[0].data : JSON.parse(res.rows[0].data || '{}'),
        updated_at: res.rows[0].updated_at
      };
    } catch (err) {
      console.error('[DATABASE] Postgres saveUserDashboard error:', err);
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  const dashIndex = db.user_dashboards.findIndex(d => d.user_id === userId);
  const updatedDash: UserDashboard = {
    user_id: userId,
    selected_areas: selectedAreas,
    data,
    updated_at: new Date()
  };

  if (dashIndex !== -1) {
    db.user_dashboards[dashIndex] = updatedDash;
  } else {
    db.user_dashboards.push(updatedDash);
  }
  writeFallbackDb(db);
  return updatedDash;
}

export async function getAllOptedInUsers(): Promise<User[]> {
  await initDb();
  if (isPostgres && dbPool) {
    try {
      const res = await dbPool.query('SELECT * FROM users WHERE briefing_opt_in = TRUE');
      return res.rows;
    } catch (err) {
      console.error('[DATABASE] Postgres getAllOptedInUsers error:', err);
    }
  }

  // JSON Fallback
  const db = readFallbackDb();
  return db.users.filter(u => u.briefing_opt_in === true);
}

export async function getAllUsers(): Promise<any[]> {
  await initDb();
  if (isPostgres && dbPool) {
    const res = await dbPool.query(`
      SELECT u.id, u.email, u.name, u.phone, u.briefing_opt_in, u.briefing_time, u.created_at,
             d.selected_areas, d.updated_at as dashboard_updated_at
      FROM users u
      LEFT JOIN user_dashboards d ON d.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    return res.rows;
  }

  // JSON Fallback
  const db = readFallbackDb();
  return db.users.map(u => {
    const dash = db.user_dashboards.find((d: any) => d.user_id === u.id);
    return { ...u, selected_areas: dash?.selected_areas || [], dashboard_updated_at: dash?.updated_at };
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await initDb();
  if (isPostgres && dbPool) {
    await dbPool.query('DELETE FROM user_dashboards WHERE user_id = $1', [userId]);
    await dbPool.query('DELETE FROM users WHERE id = $1', [userId]);
    return;
  }

  // JSON Fallback
  const db = readFallbackDb();
  db.users = db.users.filter(u => u.id !== userId);
  db.user_dashboards = db.user_dashboards.filter((d: any) => d.user_id !== userId);
  writeFallbackDb(db);
}
