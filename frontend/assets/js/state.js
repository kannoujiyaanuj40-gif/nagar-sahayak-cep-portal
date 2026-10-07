/* state.js — session state helpers. Token lives in localStorage (survives
   refresh); the user object is cached alongside it so the header can render
   instantly without waiting on a network round trip. */
const Auth = (() => {
  const TOKEN_KEY = 'nagar_token';
  const USER_KEY = 'nagar_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  function setSession(user, token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function isLoggedIn() { return !!getToken() && !!getUser(); }
  function isAdmin() {
    const u = getUser();
    return !!u && u.role === 'admin';
  }
  return { getToken, getUser, setSession, clearSession, isLoggedIn, isAdmin };
})();
