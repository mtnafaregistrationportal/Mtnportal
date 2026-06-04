// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://mtn-afa-api.onrender.com';

async function apiCall(endpoint, method, body) {
  const session = getSession();
  const token = session?.access_token; // Get the Supabase JWT token
  
  const options = {
    method: method || 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };
  
  // ✅ ADD AUTHORIZATION HEADER with Supabase access token
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(API_BASE_URL + endpoint, options);
  return response.json();
}

function getSession() { return JSON.parse(localStorage.getItem('session') || 'null'); }
function setSession(session) { localStorage.setItem('session', JSON.stringify(session)); }
function clearSession() { localStorage.removeItem('session'); localStorage.removeItem('user'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }
function setUser(user) { localStorage.setItem('user', JSON.stringify(user)); }

// ============================================
// SUPABASE CONFIG (for Reset-password.html)
// ============================================
const SUPABASE_URL = 'https://iqzjpdynmnucxswbrkho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxempwZHlubW51Y3hzd2Jya2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDY1OTksImV4cCI6MjA5NTc4MjU5OX0.Wro7xlYFR2zNIVitHSWI6itG5jPFYLMa2kpctGkY3QQ';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
