// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://mtn-afa-api.onrender.com';

// ============================================
// SECURITY: XSS Sanitization Helper
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// NETWORK / OFFLINE HANDLING
// ============================================
let isServerOnline = true;

async function checkServerConnection() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      isServerOnline = true;
      return true;
    }
  } catch (e) {
    // Server unreachable
  }
  
  isServerOnline = false;
  return false;
}

setInterval(checkServerConnection, 30000);
setTimeout(checkServerConnection, 2000);

// ============================================
// apiCall with better error handling
// ============================================
async function apiCall(endpoint, method, body) {
  let token = await getValidToken();
  
  const options = {
    method: method || 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) options.body = JSON.stringify(body);
  
  let response;
  try {
    response = await fetch(API_BASE_URL + endpoint, options);
  } catch (networkError) {
    isServerOnline = false;
    throw new Error('Unable to connect to server. Please check your internet connection and try again.');
  }
  
  if ((response.status === 401 || response.status === 403) && endpoint !== '/api/auth/signin' && endpoint !== '/api/auth/signup') {
    const refreshed = await refreshToken();
    if (refreshed) {
      token = await getValidToken();
      options.headers['Authorization'] = `Bearer ${token}`;
      try {
        response = await fetch(API_BASE_URL + endpoint, options);
      } catch (networkError) {
        isServerOnline = false;
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
    } else {
      clearSession();
      window.location.href = 'signin.html';
      throw new Error('Session expired. Please sign in again.');
    }
  }
  
  const data = await response.json();
  
  if (!data.success && (data.error?.includes('token') || data.error?.includes('Access denied') || data.error?.includes('Invalid or expired'))) {
    clearSession();
    window.location.href = 'signin.html';
    throw new Error(data.error || 'Session expired');
  }
  
  return data;
}

// ============================================
// Get valid token
// ============================================
async function getValidToken() {
  const session = getSession();
  
  if (session && session.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at - now < 300) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newSession = getSession();
        return newSession?.access_token || localStorage.getItem('access_token');
      }
    }
  }
  
  return session?.access_token || localStorage.getItem('access_token');
}

// ============================================
// Refresh token
// ============================================
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      const newSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_at: data.expires_at || Math.floor(Date.now() / 1000) + 3600,
        user: data.user
      };
      setSession(newSession);
      if (data.user) setUser(data.user);
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

// ============================================
// SESSION & USER MANAGEMENT
// ============================================
function getSession() { 
  return JSON.parse(localStorage.getItem('session') || 'null'); 
}

function setSession(session) { 
  localStorage.setItem('session', JSON.stringify(session));
  if (session && session.access_token) {
    localStorage.setItem('access_token', session.access_token);
  }
  if (session && session.refresh_token) {
    localStorage.setItem('refresh_token', session.refresh_token);
  }
  if (session && session.expires_at) {
    localStorage.setItem('expires_at', session.expires_at.toString());
  }
}

function clearSession() { 
  localStorage.removeItem('session'); 
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expires_at');
  localStorage.removeItem('user');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('profilePicture');
  localStorage.removeItem('userProfilePicture');
  localStorage.removeItem('cachedOrders');
  localStorage.removeItem('sb-iqzjpdynmnucxswbrkho-auth-token');
}

function getUser() { 
  return JSON.parse(localStorage.getItem('user') || 'null'); 
}

function setUser(user) { 
  localStorage.setItem('user', JSON.stringify(user));
  if (user) {
    if (user.id) localStorage.setItem('userId', user.id);
    if (user.name || user.fullName || user.user_metadata?.full_name) {
      localStorage.setItem('userName', user.name || user.fullName || user.user_metadata?.full_name);
    }
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.phone) localStorage.setItem('userPhone', user.phone);
  }
}

// ============================================
// SUPABASE CONFIG - ROBUST INITIALIZATION
// ============================================
const SUPABASE_URL = 'https://iqzjpdynmnucxswbrkho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxempwZHlubW51Y3hzd2Jya2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDY1OTksImV4cCI6MjA5NTc4MjU5OX0.Wro7xlYFR2zNIVitHSWI6itG5jPFYLMa2kpctGkY3QQ';

let supabaseClient = null;

function initSupabase() {
  // Try different ways Supabase might be exposed
  const supabaseLib = window.supabase || window.supabaseJs;
  
  if (supabaseLib && supabaseLib.createClient) {
    supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  
  // Check if it's already initialized globally
  if (window.supabaseClient) {
    supabaseClient = window.supabaseClient;
    return true;
  }
  
  return false;
}

// Try immediately
if (!initSupabase()) {
  // Retry after delays if supabase script hasn't loaded yet
  setTimeout(initSupabase, 500);
  setTimeout(initSupabase, 1500);
  setTimeout(initSupabase, 3000);
}

// Helper to get supabase client (waits if needed)
async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  // Try to init again
  if (initSupabase()) return supabaseClient;
  
  // Wait a bit and retry
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (initSupabase()) return supabaseClient;
  
  throw new Error('Supabase client not available. Please refresh the page.');
}
