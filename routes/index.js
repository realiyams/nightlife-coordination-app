const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const homeController = require('../controllers/homeController');
const placesController = require('../controllers/placesController');

// Rute utama dipindahkan ke homeController
router.get('/', homeController.renderHomePage);

// Gunakan rute autentikasi
router.use(authRoutes);

// Rute untuk mencari bar dan pub
router.get('/places/search', placesController.getBarsAndPubs);

// Rute untuk menangani POST request dari tombol "Go There"
router.post('/places/go-there', placesController.handleGoThere);

module.exports = router;
