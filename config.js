const API_BASE_URL = 'https://mtn-afa-api.onrender.com';

async function apiCall(endpoint, method, body) {
  const options = {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(API_BASE_URL + endpoint, options);
  return response.json();
}

function getSession() { return JSON.parse(localStorage.getItem('session') || 'null'); }
function setSession(session) { localStorage.setItem('session', JSON.stringify(session)); }
function clearSession() { localStorage.removeItem('session'); localStorage.removeItem('user'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }
function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
