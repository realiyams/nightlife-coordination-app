const axios = require('axios');
const { Bar, UserBar } = require('../models'); // Impor model Bar dan UserBar

exports.getBarsAndPubs = async (req, res) => {
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
};

exports.handleGoThere = async (req, res) => {
  const { userId, username, bar } = req.body;

  console.log("User Location Request:");
  console.log("User ID:", userId);
  console.log("Username:", username);
  console.log("Bar Details:", bar);

  try {
    // Cek apakah data bar sudah ada
    let existingBar = await Bar.findOne({ where: { place_id: bar.place_id } });

    if (!existingBar) {
      // Jika belum ada, simpan data bar ke database
      existingBar = await Bar.create({
        place_id: bar.place_id,
        name: bar.name,
        country: bar.country,
        state: bar.state,
        city: bar.city,
        postcode: bar.postcode,
        lon: bar.coordinates.lon,
        lat: bar.coordinates.lat,
        formatted: bar.formatted,
        categories: bar.categories,
        details: bar.details,
        opening_hours: bar.opening_hours,
      });

      console.log("Bar data saved to the database.");
    } else {
      console.log("Bar data already exists in the database.");
    }

    // Cek apakah hubungan antara user dan bar sudah ada di UserBar
    const existingUserBar = await UserBar.findOne({
      where: {
        user_id: userId,
        place_id: bar.place_id,
      },
    });

    if (!existingUserBar) {
      // Jika belum ada, simpan hubungan ke tabel UserBar
      await UserBar.create({
        user_id: userId,
        place_id: bar.place_id,
      });

      console.log("User-Bar relationship saved to the database.");
    } else {
      console.log("User-Bar relationship already exists in the database.");
    }

    res.status(200).send({ message: 'Location and user-bar relationship processed successfully!' });
  } catch (error) {
    console.error("Error handling user-bar relationship:", error);
    res.status(500).send({ error: 'An error occurred while processing the request.' });
  }
};


