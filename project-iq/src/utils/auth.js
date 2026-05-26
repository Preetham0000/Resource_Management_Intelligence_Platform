export const getToken  = () => localStorage.getItem("token");
export const getRole   = () => localStorage.getItem("role");
export const isLoggedIn = () => !!getToken();

export const saveAuth = (token, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
};

// Attach JWT to every fetch call automatically
export const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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