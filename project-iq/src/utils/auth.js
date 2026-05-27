// API Configuration
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api';

// API Functions
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }
  
  // Handle both JWT token string and JSON response
  const contentType = response.headers.get('content-type');
  let token;
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    token = data.token || data; // Handle both {token: "..."} and just the token string
  } else {
    token = await response.text();
  }
  
  return { token };
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Registration failed');
  }
  
  // Handle both JWT token string and JSON response
  const contentType = response.headers.get('content-type');
  let token;
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    token = data.token || data;
  } else {
    token = await response.text();
  }
  
  return { token };
};

// Storage Functions
export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const isLoggedIn = () => !!getToken();

export const saveAuth = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/';
};

// Attach JWT to every fetch call automatically
export const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  }).then(res => {
    if (res.status === 401) {
      logout(); // token expired — kick back to login
    }
    return res;
  });
};