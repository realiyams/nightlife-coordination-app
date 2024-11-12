const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
// const placesController = require('../controllers/loginController');

// Halaman utama
router.get('/', (req, res) => {
  res.render('layouts/layout', { title: 'Nightlife Coordination', body: '../pages/home' });
});

router.get('/login', (req, res) => {
  res.render('layouts/layout', { title: 'Login', errorMessage: null, body: '../pages/login' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Implementasi login logic di sini

  // Redirect atau render halaman dengan pesan error jika login gagal
  if (loginSuccessful) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { title: 'Login', errorMessage: 'Invalid username or password' });
  }
});

// Endpoint untuk mencari bar dan pub berdasarkan nama kota
router.get('/places/search', placesController.getBarsAndPubs);

module.exports = router;
