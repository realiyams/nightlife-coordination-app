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
  if (req.session.user) {
    return res.redirect('/'); // Redirect to home page if the user is logged in
  }
  next(); // Proceed if the user is not logged in
}

// Halaman utama
router.get('/', (req, res) => {
  res.render('layouts/layout', {
    title: 'Nightlife Coordination',
    body: '../pages/home',
    user: req.session.user || null // Access user from session
  });
});

router.get('/login', ensureNotAuthenticated, (req, res) => {
  const errorMessage = req.flash('error');
  const successMessage = req.flash('success');

  res.render('layouts/layout', {
    title: 'Login',
    errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    successMessage: successMessage.length > 0 ? successMessage[0] : null,
    body: '../pages/login',
    user: null
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/login');
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    
    // Store user in session
    req.session.user = { id: user.id, username: user.username };

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Something went wrong');
    res.redirect('/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.clearCookie('token'); // Optional if you’re using cookies for authentication
    res.redirect('/'); // Redirect to login page after logout
  });
});


// Menangani proses registrasi
router.post('/register', async (req, res) => {
  const { username, firstName, lastName, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash('error', 'Password and confirm password do not match');
    return res.redirect('/register'); // Redirect kembali ke halaman registrasi
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      firstName,
      lastName,
      password: hashedPassword
    });

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login'); // Redirect ke halaman login dengan pesan sukses
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/register');
  }
});

// Modifikasi GET /register route untuk mengambil flash message
router.get('/register', ensureNotAuthenticated, (req, res) => {
  const errorMessage = req.flash('error');
  const successMessage = req.flash('success');

  res.render('layouts/layout', {
    title: 'Register',
    body: '../pages/register',
    error: errorMessage.length > 0 ? errorMessage[0] : null,
    success: successMessage.length > 0 ? successMessage[0] : null,
    user: req.session.user || null
  });
});

// Endpoint untuk mencari bar dan pub berdasarkan nama kota
router.get('/places/search', placesController.getBarsAndPubs);

module.exports = router;
