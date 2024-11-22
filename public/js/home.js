let map;
let markers = [];

function initializeMap(lat = 0, lon = 0, zoom = 2) {
  document.getElementById('map').style.display = 'block';
  if (map) map.remove();
  map = L.map('map').setView([lat, lon], zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function addMarkers(bars) {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  bars.forEach(bar => {
    const coordinates = bar.geometry.coordinates;
    const marker = L.marker([coordinates[1], coordinates[0]]).addTo(map)
      .bindPopup(`<b>${bar.properties.name || 'Unknown Bar'}</b><br>${bar.properties.address_line1 || ''}`);
    markers.push(marker);
  });

  if (bars.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.5));
  }
}

async function submitSearch(city) {
  const barsList = document.getElementById('barsList');
  const userId = document.getElementById('user-info').getAttribute('data-id') || null;
  const username = document.getElementById('user-info').getAttribute('data-username') || null;

  barsList.innerHTML = "<p>Loading bars...</p>";

  try {
    const query = userId ? `city=${city}&userId=${userId}` : `city=${city}`;
    const response = await fetch(`/places/search?${query}`);
    const bars = await response.json();

    if (bars.length > 0) {
      const firstCoordinates = bars[0].geometry.coordinates;
      initializeMap(firstCoordinates[1], firstCoordinates[0], 13);
      addMarkers(bars);

      const userInfo = document.getElementById('user-info');
      const isLoggedIn = userInfo.getAttribute('data-logged-in') === 'true';

      barsList.innerHTML = bars.map((bar, index) => {
        const planToGo = bar.properties.planToGo;
        return `
          <div class="bar-item" data-index="${index}">
            <h3>${bar.properties.name || 'Unknown Bar'}</h3>
            <p>${bar.properties.address_line1 || ''}, ${bar.properties.city || ''}</p>
            <p><strong>Opening Hours:</strong> ${bar.properties.opening_hours || 'Not available'}</p>
            <button class="go-there-btn" data-index="${index}" style="${isLoggedIn ? (planToGo ? 'display: none;' : 'display: inline;') : 'display: none;'}">Plan to Visit</button>
            <button class="remove-btn" data-index="${index}" style="${isLoggedIn ? (planToGo ? 'display: inline;' : 'display: none;') : 'display: none;'}">Cancel Plan</button>
          </div>
        `;
      }).join('');

      // Event listener untuk tombol "Go There"
      document.querySelectorAll('.go-there-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const index = btn.getAttribute('data-index');
          const bar = bars[index];
          const coordinates = bar.geometry.coordinates;
          // Fokus pada bar di peta
          map.setView([coordinates[1], coordinates[0]], 16);
          markers[index].openPopup();
          try {
            const response = await fetch('/places/go-there', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId,
                username,
                bar: {
                  place_id: bar.properties.place_id || '', // ID unik
                  name: bar.properties.name || 'Unknown Bar', // Nama bar
                  country: bar.properties.country || '', // Negara
                  state: bar.properties.state || '', // Provinsi/State
                  city: bar.properties.city || '', // Kota
                  postcode: bar.properties.postcode || '', // Kode Pos
                  coordinates: {
                    lat: coordinates[1],
                    lon: coordinates[0]
                  },
                  formatted: bar.properties.formatted || '', // Alamat lengkap
                  categories: bar.properties.categories || [], // Kategori
                  details: bar.properties.details || [], // Detail tambahan
                  opening_hours: bar.properties.opening_hours || '', // Jam operasional
                }
              })
            });
            if (response.ok) {
              console.log("Location successfully sent!");
              // Tampilkan konfirmasi atau aksi lainnya
            } else {
              console.error("Failed to send location:", response.statusText);
            }
          } catch (error) {
            console.error("Error sending location:", error);
          }
          // Tampilkan tombol "Remove" dan sembunyikan "Go There"
          btn.style.display = 'none';
          document.querySelector(`.remove-btn[data-index="${index}"]`).style.display = 'inline';
        });
      });
      // Event listener untuk tombol "Remove"
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const index = btn.getAttribute('data-index');
          const bar = bars[index];
          const placeId = bar.properties.place_id;
          try {
            const response = await fetch('/places/remove', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                placeId,
              }),
            });
            if (response.ok) {
              console.log("Relationship successfully removed!");
              // Tampilkan tombol "Go There" dan sembunyikan "Remove"
              btn.style.display = 'none';
              document.querySelector(`.go-there-btn[data-index="${index}"]`).style.display = 'inline';
            } else {
              console.error("Failed to remove relationship:", response.statusText);
            }
          } catch (error) {
            console.error("Error removing relationship:", error);
          }
        });
      });
    } else {
      barsList.innerHTML = "<p>No bars or pubs found for this city.</p>";
      initializeMap();
    }
  } catch (error) {
    console.error("Error fetching bars:", error);
    barsList.innerHTML = "<p>Failed to load bars. Try again.</p>";
    initializeMap();
  }
}

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('city').value;
  await submitSearch(city);

  const userId = document.getElementById('user-info').getAttribute('data-id') || null;
  // Save the city value in the backend or localStorage
  if (userId) {
    try {
      // Send the city value to the backend for logged-in users using fetch
      const response = await fetch('/user/updateCity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, city })
      });

      if (!response.ok) {
        throw new Error('Failed to update city');
      }
    } catch (error) {
      console.error("Error updating city for user:", error);
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = document.getElementById('user-info');
  const userId = userInfo.getAttribute('data-id');
  const isLoggedIn = userInfo.getAttribute('data-logged-in') === 'true';

  if (isLoggedIn) {
    try {
      // Fetch the city for the logged-in user
      const response = await fetch(`/user/city?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.city) {
        document.getElementById('city').value = data.city;
        await submitSearch(data.city); // Automatically trigger search with user's city
      }
    } catch (error) {
      console.error("Error fetching user's city:", error);
    }
  }
});



