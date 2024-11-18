const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute untuk login
router.get('/login', authController.ensureNotAuthenticated, (req, res) => {
  const errorMessage = req.flash('error');
  const successMessage = req.flash('success');

  res.render('layouts/layout', {
    title: 'Login',
    errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    successMessage: successMessage.length > 0 ? successMessage[0] : null,
    body: '../pages/login',
    user: null,
  });
});

router.post('/login', authController.login);

// Rute untuk logout
router.post('/logout', authController.logout);

// Rute untuk registrasi
router.get('/register', authController.ensureNotAuthenticated, (req, res) => {
  const errorMessage = req.flash('error');
  const successMessage = req.flash('success');

  res.render('layouts/layout', {
    title: 'Register',
    body: '../pages/register',
    error: errorMessage.length > 0 ? errorMessage[0] : null,
    success: successMessage.length > 0 ? successMessage[0] : null,
    user: null,
  });
});

router.post('/register', authController.register);

module.exports = router;
