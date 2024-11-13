const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
// const placesController = require('../controllers/loginController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models').User;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized jika token tidak ada
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden jika token tidak valid
    }

    req.user = user; // Simpan data user di request
    next();
  });
}

function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null; // Set req.user ke null jika tidak ada token
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null; // Jika token tidak valid, set req.user ke null
      return next();
    }

    req.user = user; // Simpan data user di request jika token valid
    next();
  });
}



// Halaman utama
router.get('/', optionalAuthenticateToken, (req, res) => {
  res.render('layouts/layout', { title: 'Nightlife Coordination', body: '../pages/home', user: req.user });
});

router.get('/login', (req, res) => {
  res.render('layouts/layout', { title: 'Login', errorMessage: null, body: '../pages/login' });
});

// Secret key untuk JWT (simpan ini di environment variable, bukan di kode)
const JWT_SECRET = 'your-secret-key';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari user berdasarkan username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Bandingkan password yang dimasukkan dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Buat JWT token jika login berhasil
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' } // Token berlaku selama 1 jam
      );

      // Kirim token ke frontend
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Menampilkan form registrasi
router.get('/register', (req, res) => {
  res.render('layouts/layout', { title: 'Register', body: '../pages/register', error: null });
});

// Menangani proses registrasi
router.post('/register', async (req, res) => {
  const { username, firstName, lastName, password, confirmPassword } = req.body;

  // Validasi password dan konfirmasi password
  if (password !== confirmPassword) {
    return res.render('layouts/layout', {
      title: 'Register',
      body: '../pages/register',
      error: 'Password and confirm password do not match'
    });
  }

  try {
    // Cek apakah username sudah ada
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.render('layouts/layout', {
        title: 'Register',
        body: '../pages/register',
        error: 'Username already exists'
      });
    }

    // Enkripsi password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    await User.create({
      username,
      firstName,
      lastName,
      password: hashedPassword
    });

    // Redirect ke halaman login setelah sukses registrasi
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('layouts/layout', {
      title: 'Register',
      body: '../pages/register',
      error: 'Something went wrong. Please try again.'
    });
  }
});

// Endpoint untuk mencari bar dan pub berdasarkan nama kota
router.get('/places/search', placesController.getBarsAndPubs);

module.exports = router;
