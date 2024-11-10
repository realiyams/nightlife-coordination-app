// routes/index.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Halaman utama
router.get('/', (req, res) => {
  res.render('layouts/layout', { title: 'Nightlife Coordination', body: '../pages/home' });
});

// Endpoint untuk mencari bar dan pub berdasarkan nama kota
router.get('/places/search', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City name is required." });
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;

  try {
    // Langkah 1: Dapatkan koordinat kota menggunakan Geoapify Geocoding API
    const geoResponse = await axios.get(`https://api.geoapify.com/v1/geocode/search`, {
      params: {
        text: city,
        apiKey: apiKey
      }
    });

    if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
      return res.status(404).json({ error: "City not found." });
    }

    // Ambil koordinat dari hasil geocoding
    const { lat, lon } = geoResponse.data.features[0].properties;

    // Langkah 2: Cari bar dan pub di sekitar koordinat tersebut
    const placeResponse = await axios.get(`https://api.geoapify.com/v2/places`, {
      params: {
        categories: "catering.bar,catering.pub",
        filter: `circle:${lon},${lat},5000`, // Radius 5000 meter
        limit: 10,
        apiKey: apiKey
      }
    });

    // Kirim hasil dalam format JSON
    res.json(placeResponse.data.features);

  } catch (error) {
    console.error("Error fetching data from Geoapify:", error);
    res.status(500).json({ error: "Failed to fetch places." });
  }
});

module.exports = router;
