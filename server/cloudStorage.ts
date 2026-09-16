import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CardConfig } from '../src/types.js';

export interface StoredCard {
  id: string;
  createdAt: string;
  updatedAt: string;
  config: CardConfig;
}

// ─── Environment Variables ──────────────────────────────────────
const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

function isUpstashConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

// ─── Helper: Execute Upstash Redis REST command ─────────────────
async function runRedisCommand<T = any>(command: (string | number)[]): Promise<T | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
    if (!res.ok) {
      console.warn('Upstash Redis error status:', res.status);
      return null;
    }
    const json = await res.json();
    return json.result as T;
  } catch (err) {
    console.warn('Upstash Redis request failed:', err);
    return null;
  }
}

// ─── Local Filesystem Storage Fallback ──────────────────────────
let localDataDir: string | null = null;
let localDataFile: string | null = null;

try {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  localDataDir = path.resolve(currentDir, '../data');
  localDataFile = path.join(localDataDir, 'cards.json');
} catch {
  localDataDir = path.resolve(process.cwd(), 'data');
  localDataFile = path.join(localDataDir, 'cards.json');
}

function readLocalAll(): Record<string, StoredCard> {
  try {
    if (localDataFile && fs.existsSync(localDataFile)) {
      const raw = fs.readFileSync(localDataFile, 'utf-8');
      return JSON.parse(raw) as Record<string, StoredCard>;
    }
  } catch (err) {
    console.warn('Local read error:', err);
  }
  return {};
}

function writeLocalAll(data: Record<string, StoredCard>): void {
  try {
    if (localDataDir && !fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    if (localDataFile) {
      fs.writeFileSync(localDataFile, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Local write warning (read-only filesystem in cloud):', err);
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── Unified Cloud Storage Operations ───────────────────────────

/** Lấy 1 card theo ID */
export async function getCard(id: string): Promise<StoredCard | null> {
  const key = id.toUpperCase();

  // 1. Upstash Redis / Vercel KV
  if (isUpstashConfigured()) {
    const raw = await runRedisCommand<string | StoredCard>(['GET', `card:${key}`]);
    if (raw) {
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return raw as StoredCard;
    }
    return null;
  }

  // 2. Supabase
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cards?id=eq.${key}&select=*`, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            createdAt: row.created_at || row.createdAt,
            updatedAt: row.updated_at || row.updatedAt,
            config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
          };
        }
      }
    } catch (e) {
      console.warn('Supabase get error:', e);
    }
  }

  // 3. Fallback: Local filesystem
  const local = readLocalAll();
  return local[key] || null;
}

/** Lấy danh sách tất cả cards (metadata) */
export async function getAllCards(): Promise<Array<Omit<StoredCard, 'config'>>> {
  // 1. Upstash Redis / Vercel KV
  if (isUpstashConfigured()) {
    const ids = (await runRedisCommand<string[]>(['SMEMBERS', 'cards:all'])) || [];
    const list: Array<Omit<StoredCard, 'config'>> = [];
    for (const id of ids) {
      const card = await getCard(id);
      if (card) {
        list.push({ id: card.id, createdAt: card.createdAt, updatedAt: card.updatedAt });
      }
    }
    return list;
  }

  // 2. Supabase
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cards?select=id,created_at,updated_at`, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        return rows.map((r: any) => ({
          id: r.id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase getAll error:', e);
    }
  }

  // 3. Fallback: Local filesystem
  const local = readLocalAll();
  return Object.values(local).map(({ id, createdAt, updatedAt }) => ({
    id,
    createdAt,
    updatedAt,
  }));
}

/** Tạo card mới, lưu lên Cloud DB (hoặc local fallback) */
export async function createCard(config: CardConfig): Promise<StoredCard> {
  const id = generateId();
  const now = new Date().toISOString();
  const card: StoredCard = { id, createdAt: now, updatedAt: now, config };

  // 1. Upstash Redis / Vercel KV
  if (isUpstashConfigured()) {
    await runRedisCommand(['SET', `card:${id}`, JSON.stringify(card)]);
    await runRedisCommand(['SADD', 'cards:all', id]);
    return card;
  }

  // 2. Supabase
  if (isSupabaseConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/cards`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id,
          created_at: now,
          updated_at: now,
          config: JSON.stringify(config),
        }),
      });
      return card;
    } catch (e) {
      console.warn('Supabase create error:', e);
    }
  }

  // 3. Fallback: Local filesystem
  const local = readLocalAll();
  local[id] = card;
  writeLocalAll(local);
  return card;
}

/** Cập nhật card theo ID */
export async function updateCard(id: string, config: CardConfig): Promise<StoredCard | null> {
  const key = id.toUpperCase();
  const existing = await getCard(key);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: StoredCard = {
    ...existing,
    config,
    updatedAt: now,
  };

  // 1. Upstash Redis / Vercel KV
  if (isUpstashConfigured()) {
    await runRedisCommand(['SET', `card:${key}`, JSON.stringify(updated)]);
    return updated;
  }

  // 2. Supabase
  if (isSupabaseConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/cards?id=eq.${key}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          updated_at: now,
          config: JSON.stringify(config),
        }),
      });
      return updated;
    } catch (e) {
      console.warn('Supabase update error:', e);
    }
  }

  // 3. Fallback: Local filesystem
  const local = readLocalAll();
  local[key] = updated;
  writeLocalAll(local);
  return updated;
}

/** Xóa card theo ID */
export async function deleteCard(id: string): Promise<boolean> {
  const key = id.toUpperCase();

  // 1. Upstash Redis / Vercel KV
  if (isUpstashConfigured()) {
    await runRedisCommand(['DEL', `card:${key}`]);
    await runRedisCommand(['SREM', 'cards:all', key]);
    return true;
  }

  // 2. Supabase
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cards?id=eq.${key}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  // 3. Fallback: Local filesystem
  const local = readLocalAll();
  if (!local[key]) return false;
  delete local[key];
  writeLocalAll(local);
  return true;
}
