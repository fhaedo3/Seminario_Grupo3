export const API_BASE_URL = "http://10.0.2.2:8080/api/v1/";

export const withBaseUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
