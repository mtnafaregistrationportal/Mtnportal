// ============================================
// YOUR EXISTING CODE (unchanged)
// ============================================
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

// ============================================
// NEW: Supabase config (only used by Reset-password.html)
// ============================================
const SUPABASE_URL = 'https://iqzjpdynmnucxswbrkho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxempwZHlubW51Y3hzd2Jya2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDY1OTksImV4cCI6MjA5NTc4MjU5OX0.Wro7xlYFR2zNIVitHSWI6itG5jPFYLMa2kpctGkY3QQ';

// Initialize Supabase client
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
