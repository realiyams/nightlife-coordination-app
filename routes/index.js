const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const placesController = require('../controllers/placesController');

// Rute utama
router.get('/', (req, res) => {
  res.render('layouts/layout', {
    title: 'Nightlife Coordination',
    body: '../pages/home',
    user: req.session.user || null,
  });
});

// Gunakan rute autentikasi
router.use(authRoutes);

// Rute untuk mencari bar dan pub
router.get('/places/search', placesController.getBarsAndPubs);

module.exports = router;
