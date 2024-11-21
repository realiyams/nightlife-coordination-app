// Function to get a specific cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Check if JWT token exists in localStorage
const tokenInLocalStorage = localStorage.getItem('token');
const tokenInCookie = getCookie('token'); // Assuming your cookie is named 'token'

// console.log(tokenInLocalStorage)
// console.log(tokenInCookie)

if (!tokenInLocalStorage && tokenInCookie) {
  // No token in localStorage but found in cookie, save it to localStorage
  localStorage.setItem('token', tokenInCookie);
} else if (tokenInLocalStorage && tokenInCookie && tokenInLocalStorage !== tokenInCookie) {
  // If token exists in both but differs, update localStorage with the new one
  localStorage.setItem('token', tokenInCookie);
}