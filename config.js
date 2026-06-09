// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://mtn-afa-api.onrender.com';

// ============================================
// FIXED: apiCall with token refresh and 401 handling
// ============================================
async function apiCall(endpoint, method, body) {
  // Try to get valid token (refresh if needed)
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
  
  let response = await fetch(API_BASE_URL + endpoint, options);
  
  // If 401/403, try refreshing token once
  if ((response.status === 401 || response.status === 403) && endpoint !== '/api/auth/signin' && endpoint !== '/api/auth/signup') {
    console.log('Token expired, attempting refresh...');
    const refreshed = await refreshToken();
    if (refreshed) {
      token = await getValidToken();
      options.headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(API_BASE_URL + endpoint, options);
    } else {
      // Refresh failed - clear session and redirect
      console.log('Token refresh failed, redirecting to login...');
      clearSession();
      window.location.href = 'signin.html';
      throw new Error('Session expired. Please sign in again.');
    }
  }
  
  const data = await response.json();
  
  // Handle auth errors in response body
  if (!data.success && (data.error?.includes('token') || data.error?.includes('Access denied') || data.error?.includes('Invalid or expired'))) {
    clearSession();
    window.location.href = 'signin.html';
    throw new Error(data.error || 'Session expired');
  }
  
  return data;
}

// ============================================
// NEW: Get valid token (with refresh if expired)
// ============================================
async function getValidToken() {
  const session = getSession();
  
  // Check if token is expired
  if (session && session.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    // If expires in less than 5 minutes, refresh it
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
// NEW: Refresh token using Supabase
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
      // Update stored session
      const newSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_at: data.expires_at || Math.floor(Date.now() / 1000) + 3600,
        user: data.user
      };
      setSession(newSession);
      if (data.user) setUser(data.user);
      console.log('Token refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
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
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://iqzjpdynmnucxswbrkho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxempwZHlubW51Y3hzd2Jya2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDY1OTksImV4cCI6MjA5NTc4MjU5OX0.Wro7xlYFR2zNIVitHSWI6itG5jPFYLMa2kpctGkY3QQ';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
