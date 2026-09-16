import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CardConfig } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'cards.json');

export interface StoredCard {
  id: string;
  createdAt: string;
  updatedAt: string;
  config: CardConfig;
}

/** Đảm bảo thư mục data/ và file cards.json tồn tại */
function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

/** Đọc toàn bộ cards từ file */
function readAll(): Record<string, StoredCard> {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Record<string, StoredCard>;
  } catch {
    return {};
  }
}

/** Ghi toàn bộ cards vào file */
function writeAll(data: Record<string, StoredCard>): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** Tạo ID ngẫu nhiên 8 ký tự */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── CRUD Operations ──────────────────────────────────────────

/** Lấy tất cả cards (chỉ id + metadata, không trả config đầy đủ) */
export function getAllCards(): Array<Omit<StoredCard, 'config'>> {
  const data = readAll();
  return Object.values(data).map(({ id, createdAt, updatedAt }) => ({
    id,
    createdAt,
    updatedAt,
  }));
}

/** Lấy một card theo ID */
export function getCard(id: string): StoredCard | null {
  const data = readAll();
  return data[id] ?? null;
}

/** Tạo card mới, trả về card đã lưu (với ID được sinh) */
export function createCard(config: CardConfig): StoredCard {
  const data = readAll();
  const id = generateId();
  const now = new Date().toISOString();
  const card: StoredCard = { id, createdAt: now, updatedAt: now, config };
  data[id] = card;
  writeAll(data);
  return card;
}

/** Cập nhật card theo ID */
export function updateCard(id: string, config: CardConfig): StoredCard | null {
  const data = readAll();
  if (!data[id]) return null;
  data[id] = { ...data[id], config, updatedAt: new Date().toISOString() };
  writeAll(data);
  return data[id];
}

/** Xóa card theo ID */
export function deleteCard(id: string): boolean {
  const data = readAll();
  if (!data[id]) return false;
  delete data[id];
  writeAll(data);
  return true;
}
