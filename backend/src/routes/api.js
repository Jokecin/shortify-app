const { Router } = require('express');
const router = Router();

router.get('/test', (req, res) => {
    res.json({ message: "Backend active" });
});

module.exports = router;
 