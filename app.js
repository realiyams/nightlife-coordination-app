// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Set EJS sebagai view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Folder publik untuk static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
