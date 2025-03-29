const { Router } = require('express');
const router = Router();

const {
  createShortUrl,
  redirectUrl,
  urlStats
} = require('../controllers/urlController');

router.post('/shorten', createShortUrl);
router.get('/:shortId', redirectUrl);
router.get('/stats/:shortId', urlStats);

module.exports = router;
