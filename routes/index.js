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

// Route untuk menampilkan form registrasi
router.get('/register', (req, res) => {
  res.render('layouts/layout', { title: 'Register', body: '../pages/register' });
});

// Route untuk menangani proses registrasi
router.post('/register', async (req, res) => {
  const { username, first_name, last_name, password, confirm_password } = req.body;

  // Validasi password dan konfirmasi password
  if (password !== confirm_password) {
    return res.render('register', { error: 'Password and confirm password do not match' });
  }

  try {
    // Cek apakah username sudah ada
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.render('register', { error: 'Username already exists' });
    }

    // Enkripsi password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await User.create({
      username,
      first_name,
      last_name,
      password: hashedPassword
    });

    // Redirect ke halaman login setelah sukses registrasi
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
});

// Endpoint untuk mencari bar dan pub berdasarkan nama kota
router.get('/places/search', placesController.getBarsAndPubs);

module.exports = router;
