// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Nightlife Coordination', body: 'home' });
});

module.exports = router;
