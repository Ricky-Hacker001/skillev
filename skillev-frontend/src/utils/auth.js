export const getAuthToken = () => localStorage.getItem("skillev_token");

export const isAuthenticated = () => {
  const token = getAuthToken();
  // Basic check if token exists; in real apps, you'd decode it to check expiry
  return !!token;
};