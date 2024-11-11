const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// Halaman utama
router.get('/', (req, res) => {
  res.render('layouts/layout', { title: 'Nightlife Coordination', body: '../pages/home' });
});

// Endpoint untuk mencari bar dan pub berdasarkan nama kota
router.get('/places/search', placesController.getBarsAndPubs);

module.exports = router;
