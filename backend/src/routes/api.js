const { Router } = require('express');
const router = Router();
const db = require('../models/db');


const {
  createShortUrl,
  redirectUrl,
  urlStats
} = require('../controllers/urlController');

router.get('/history', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT short_id, original_url, created_at FROM urls ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('DB error on /history:', err); 
    res.status(500).json({ error: 'Error loading URL history' });
  }
});

router.delete('/delete/:shortId', async (req, res) => {
  const { shortId } = req.params;
  try {
    await db.query(
      'DELETE FROM clicks WHERE url_id = (SELECT id FROM urls WHERE short_id = $1)',
      [shortId]
    );

    await db.query('DELETE FROM urls WHERE short_id = $1', [shortId]);

    res.status(200).json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('Error deleting URL:', err.message);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

router.post('/shorten', createShortUrl);
router.get('/:shortId', redirectUrl);
router.get('/stats/:shortId', urlStats);

module.exports = router;
