const TOKEN_KEY = 'userKey';
const EXPIRATION_KEY = 'tokenExpiration';

export const setAuthToken = (token: string) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Token válido por 7 dias
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRATION_KEY, expirationDate.toISOString());
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRATION_KEY);
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const expiration = localStorage.getItem(EXPIRATION_KEY);
  if (!token || !expiration) return false;
  
  const expirationDate = new Date(expiration);
  return expirationDate > new Date();
};

