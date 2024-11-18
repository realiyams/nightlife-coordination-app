const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models').User;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

exports.optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  });
};

exports.ensureNotAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/login');
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { maxAge: 3600000 });

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Something went wrong');
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.clearCookie('token');
    res.redirect('/');
  });
};

exports.register = async (req, res) => {
  const { username, firstName, lastName, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash('error', 'Password and confirm password do not match');
    return res.redirect('/register');
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
      password: hashedPassword,
    });

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/register');
  }
};
