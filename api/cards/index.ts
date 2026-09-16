import type { IncomingMessage, ServerResponse } from 'http';
import { getAllCards, createCard } from '../../server/cloudStorage.js';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET /api/cards
  if (req.method === 'GET') {
    try {
      const cards = await getAllCards();
      res.status(200).json({ success: true, data: cards });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi khi đọc dữ liệu.' });
    }
    return;
  }

  // POST /api/cards
  if (req.method === 'POST') {
    try {
      const config = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!config || typeof config !== 'object') {
        res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ.' });
        return;
      }
      const card = await createCard(config);
      res.status(201).json({ success: true, data: card });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi khi lưu dữ liệu.' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
