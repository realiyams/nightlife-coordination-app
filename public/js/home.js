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

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const city = document.getElementById('city').value;
  const barsList = document.getElementById('barsList');
  const userId = document.getElementById('user-info').getAttribute('data-id') || null;
  barsList.innerHTML = "<p>Loading bars...</p>";

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
  } else {
    // For non-logged-in users, save city in localStorage
    localStorage.setItem('city', city);
  }

  try {
    const query = userId ? `city=${city}&userId=${userId}` : `city=${city}`;
    const response = await fetch(`/places/search?${query}`);
    const bars = await response.json();

    if (bars.length > 0) {
      const firstCoordinates = bars[0].geometry.coordinates;
      initializeMap(firstCoordinates[1], firstCoordinates[0], 13);
      addMarkers(bars);

      const userInfo = document.getElementById('user-info');
      const username = userInfo.getAttribute('data-username');
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
    } else {
      barsList.innerHTML = "<p>No bars or pubs found for this city.</p>";
      initializeMap();
    }
  } catch (error) {
    console.error("Error fetching bars:", error);
    barsList.innerHTML = "<p>Failed to load bars. Try again.</p>";
    initializeMap();
  }
});

// Check if the user is logged in, and if so, pre-fill the city field
document.addEventListener('DOMContentLoaded', () => {
  const userInfo = document.getElementById('user-info');
  console.log(userInfo.getAttribute('data-username'))
  if (userInfo && userInfo.getAttribute('data-logged-in') === 'true') {
    const userCity = userInfo.getAttribute('data-city');
    console.log(userCity)
    if (userCity) {
      document.getElementById('city').value = userCity;
      // Trigger the form submission with the pre-filled city value
      document.getElementById('searchForm').submit();
    }
  } 
  // else {
  //   // For non-logged-in users, check localStorage for a saved city
  //   const savedCity = localStorage.getItem('city');
  //   if (savedCity) {
  //     document.getElementById('city').value = savedCity;
  //     // Trigger the form submission with the saved city value
  //     document.getElementById('searchForm').submit();
  //   }
  // }
});

