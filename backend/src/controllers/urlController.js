const db = require('../models/db');
const generateShortId = require('../utils/generateShortId');
const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

const createShortUrl = async (req, res) => {
  const { originalUrl, custom_short_id, expires_in_days } = req.body;
  const original_url = originalUrl;

  try {
    console.log('Request body:', req.body);
    const short_id = custom_short_id || generateShortId();
    const custom = !!custom_short_id;
    console.log('[DEBUG] BASE_URL:', baseUrl);
    const days = parseInt(expires_in_days) || 3;
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + days);

    // Check if short_id already exists
    const existing = await db.query('SELECT * FROM urls WHERE short_id = $1', [short_id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Short ID already exists, choose another.' });
    }

    // Insert into DB
    await db.query(
      'INSERT INTO urls (short_id, original_url, expires_at, custom) VALUES ($1, $2, $3, $4)',
      [short_id, original_url, expires_at, custom]
    );

    res.status(201).json({
      short_id: short_id,
      short_url: `${baseUrl}/api/${short_id}`,
      expires_at: expires_at
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error, please try again.' });
  }
};

const redirectUrl = async (req, res) => {
  const { shortId } = req.params;

  try {
    const urlData = await db.query(
      'SELECT * FROM urls WHERE short_id = $1 AND expires_at > NOW()',
      [shortId]
    );

    if (urlData.rows.length === 0) {
      return res.status(404).send('URL not found or expired.');
    }

    // Register click
    await db.query(
      'INSERT INTO clicks (url_id, user_agent, ip_address) VALUES ($1, $2, $3)',
      [urlData.rows[0].id, req.headers['user-agent'], req.ip]
    );

    res.redirect(urlData.rows[0].original_url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};;

const urlStats = async (req, res) => {
  const { shortId } = req.params;

  try {
    const urlData = await db.query('SELECT * FROM urls WHERE short_id = $1', [shortId]);

    if (urlData.rows.length === 0) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    const clicks = await db.query(
      'SELECT COUNT(*) FROM clicks WHERE url_id = $1',
      [urlData.rows[0].id]
    );

    res.json({
      short_id: shortId,
      original_url: urlData.rows[0].original_url,
      clicks: clicks.rows[0].count,
      created_at: urlData.rows[0].created_at,
      expires_at: urlData.rows[0].expires_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createShortUrl,
  redirectUrl,
  urlStats
};
