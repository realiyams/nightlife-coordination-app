const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
// const placesController = require('../controllers/loginController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models').User;

// Secret key untuk JWT (simpan ini di environment variable, bukan di kode)
const JWT_SECRET = 'your-secret-key';

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
    req.user = null; // Set req.user to null if there's no token
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null; // If the token is invalid, set req.user to null
      return next();
    }

    req.user = user; // Set the user data if the token is valid
    next();
  });
}


function ensureNotAuthenticated(req, res, next) {
  if (req.user) {
    return res.redirect('/'); // Redirect to home page if the user is logged in
  }
  next(); // Proceed if the user is not logged in
}

// Halaman utama
router.get('/', optionalAuthenticateToken, (req, res) => {
  // Pass 'user' from the request to the view, which can be null if not logged in
  res.render('layouts/layout', {
    title: 'Nightlife Coordination',
    body: '../pages/home',
    user: req.user // If the user is logged in, req.user will contain the user object, otherwise it will be null
  });
});

router.get('/login', ensureNotAuthenticated, (req, res) => {
  res.render('layouts/layout', {
    title: 'Login',
    errorMessage: null,
    body: '../pages/login',
    user: req.user || null // Pass user as null if not logged in
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).render('layouts/layout', { title: 'Login', body: '../pages/login', message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // Set token as httpOnly cookie for 1 hour
      res.redirect('/'); // Redirect to home
    } else {
      res.status(401).render('layouts/layout', { title: 'Login', body: '../pages/login', message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('layouts/layout', { title: 'Login', body: '../pages/login', message: 'Something went wrong' });
  }
});


router.post('/logout', (req, res) => {
  res.clearCookie('token'); // Menghapus cookie token
  res.redirect('/'); // Kembali ke halaman utama atau login
});

// Menampilkan form registrasi
router.get('/register', ensureNotAuthenticated, (req, res) => {
  res.render('layouts/layout', {
    title: 'Register', body: '../pages/register', error: null,
    user: req.user || null // Pass user as null if not logged in
  });
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
