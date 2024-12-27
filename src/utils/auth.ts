export const setAuthToken = (token: string) => {
  localStorage.setItem('userKey', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('userKey');
};

export const removeAuthToken = () => {
  localStorage.removeItem('userKey');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
