import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAllCards, getCard, createCard, updateCard, deleteCard } from './cloudStorage.js';
import { CardConfig } from '../src/types.js';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// ─── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── GET /api/cards — Lấy danh sách tất cả cards (metadata) ────
app.get('/api/cards', async (_req: Request, res: Response) => {
  try {
    const cards = await getAllCards();
    res.json({ success: true, data: cards });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi khi đọc dữ liệu.' });
  }
});

// ─── GET /api/cards/:id — Lấy 1 card theo ID ───────────────────
app.get('/api/cards/:id', async (req: Request, res: Response) => {
  try {
    const card = await getCard(req.params.id.toUpperCase());
    if (!card) {
      res.status(404).json({ success: false, error: 'Không tìm thấy card.' });
      return;
    }
    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi khi đọc dữ liệu.' });
  }
});

// ─── POST /api/cards — Tạo card mới ────────────────────────────
app.post('/api/cards', async (req: Request, res: Response) => {
  try {
    const config = req.body as CardConfig;
    if (!config || typeof config !== 'object') {
      res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ.' });
      return;
    }
    const card = await createCard(config);
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi khi lưu dữ liệu.' });
  }
});

// ─── PUT /api/cards/:id — Cập nhật card ────────────────────────
app.put('/api/cards/:id', async (req: Request, res: Response) => {
  try {
    const config = req.body as CardConfig;
    if (!config || typeof config !== 'object') {
      res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ.' });
      return;
    }
    const card = await updateCard(req.params.id.toUpperCase(), config);
    if (!card) {
      res.status(404).json({ success: false, error: 'Không tìm thấy card.' });
      return;
    }
    res.json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật dữ liệu.' });
  }
});

// ─── DELETE /api/cards/:id — Xóa card ──────────────────────────
app.delete('/api/cards/:id', async (req: Request, res: Response) => {
  try {
    const ok = await deleteCard(req.params.id.toUpperCase());
    if (!ok) {
      res.status(404).json({ success: false, error: 'Không tìm thấy card.' });
      return;
    }
    res.json({ success: true, message: 'Đã xóa card.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi khi xóa dữ liệu.' });
  }
});

// ─── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server đang chạy tại: http://localhost:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/cards`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
