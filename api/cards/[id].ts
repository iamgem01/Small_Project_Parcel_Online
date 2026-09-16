import { getCard, updateCard, deleteCard } from '../../server/cloudStorage.js';

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

  // Extract ID from query param (Vercel automatically populates req.query.id for [id].ts)
  const id = req.query?.id as string;
  if (!id) {
    res.status(400).json({ success: false, error: 'Thiếu card ID.' });
    return;
  }

  // GET /api/cards/:id
  if (req.method === 'GET') {
    try {
      const card = await getCard(id);
      if (!card) {
        res.status(404).json({ success: false, error: 'Không tìm thấy card.' });
        return;
      }
      res.status(200).json({ success: true, data: card });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi khi đọc dữ liệu.' });
    }
    return;
  }

  // PUT /api/cards/:id
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const config = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!config || typeof config !== 'object') {
        res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ.' });
        return;
      }
      const card = await updateCard(id, config);
      if (!card) {
        res.status(404).json({ success: false, error: 'Không tìm thấy card.' });
        return;
      }
      res.status(200).json({ success: true, data: card });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi khi cập nhật dữ liệu.' });
    }
    return;
  }

  // DELETE /api/cards/:id
  if (req.method === 'DELETE') {
    try {
      const ok = await deleteCard(id);
      if (!ok) {
        res.status(404).json({ success: false, error: 'Không tìm thấy card.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Đã xóa card.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Lỗi khi xóa dữ liệu.' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
