import { Platform } from 'react-native';
import { API_BASE_URL, withBaseUrl } from '../config/api';

const memoryStorage = new Map();

const storage = {
  async getItem(key) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage.get(key) ?? null;
  },
  async setItem(key, value) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryStorage.set(key, value);
  },
  async removeItem(key) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    memoryStorage.delete(key);
  },
};

const buildUrl = (path, params) => {
  const url = new URL(withBaseUrl(path));
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item));
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

export const request = async (path, { method = 'GET', token, body, params, headers } = {}) => {
  const url = buildUrl(path, params);
  const requestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);
  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) ||
      response.statusText ||
      'Error inesperado';
    const error = new Error(Array.isArray(message) ? message.join(', ') : message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const storageKeys = {
  token: 'sip3-token',
  username: 'sip3-username',
  roles: 'sip3-roles',
};

export const persistentStorage = storage;
export { API_BASE_URL };
