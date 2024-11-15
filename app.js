// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const app = express();
const db = require('./models');  // Import file index.js dari folder models

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // Cookie expires after 1 minute
}));

// Set up flash middleware
app.use(flash());

// Menggunakan express.json() dan express.urlencoded() untuk parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS sebagai view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Folder publik untuk static files
app.use(express.static(path.join(__dirname, 'public')));

// Sync database
db.sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });

// Routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
