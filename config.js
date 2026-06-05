// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://mtn-afa-api.onrender.com';

async function apiCall(endpoint, method, body) {
  const session = getSession();
  const token = session?.access_token || localStorage.getItem('access_token');
  
  const options = {
    method: method || 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };
  
  // ADD AUTHORIZATION HEADER with Supabase access token
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(API_BASE_URL + endpoint, options);
  return response.json();
}

// ============================================
// SESSION & USER MANAGEMENT
// ============================================
function getSession() { 
  return JSON.parse(localStorage.getItem('session') || 'null'); 
}

function setSession(session) { 
  localStorage.setItem('session', JSON.stringify(session));
  // Also store access_token separately for redundancy
  if (session && session.access_token) {
    localStorage.setItem('access_token', session.access_token);
  }
  if (session && session.refresh_token) {
    localStorage.setItem('refresh_token', session.refresh_token);
  }
}

function clearSession() { 
  localStorage.removeItem('session'); 
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('profilePicture');
  localStorage.removeItem('userProfilePicture');
  localStorage.removeItem('cachedOrders');
}

function getUser() { 
  return JSON.parse(localStorage.getItem('user') || 'null'); 
}

function setUser(user) { 
  localStorage.setItem('user', JSON.stringify(user));
  // Also store individual keys for dashboard compatibility
  if (user) {
    if (user.id) localStorage.setItem('userId', user.id);
    if (user.name || user.fullName) localStorage.setItem('userName', user.name || user.fullName);
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.phone) localStorage.setItem('userPhone', user.phone);
  }
}

// ============================================
// SUPABASE CONFIG (for Reset-password.html)
// ============================================
const SUPABASE_URL = 'https://iqzjpdynmnucxswbrkho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxempwZHlubW51Y3hzd2Jya2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDY1OTksImV4cCI6MjA5NTc4MjU5OX0.Wro7xlYFR2zNIVitHSWI6itG5jPFYLMa2kpctGkY3QQ';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
