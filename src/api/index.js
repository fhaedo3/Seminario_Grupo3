import { request } from './client';

export const authApi = {
  login: (payload) => request('/api/v1/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/api/v1/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/api/v1/auth/me', { method: 'GET', token }),
};

export const usersApi = {
  updateProfile: (token, payload) => request('/users/me', { method: 'PUT', token, body: payload }),
};

export const professionalsApi = {
  search: (params = {}) => request('/professionals', { params }),
  getById: (id) => request(`/professionals/${id}`, { method: 'GET' }),
  getByUserId: (userId, token) => request(`/professionals/by-user/${userId}`, { method: 'GET', token }),
  create: (token, payload) => request('/professionals', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => request(`/professionals/${id}`, { method: 'PUT', token, body: payload }),
};

export const reviewsApi = {
  listByProfessional: (professionalId, params = {}) =>
    request('/reviews', { params: { professionalId, ...params } }),
};

export const serviceOrdersApi = {
  create: (token, payload) => request('/service-orders', { method: 'POST', token, body: payload }),
  getById: (token, id) => request(`/service-orders/${id}`, { method: 'GET', token }),
  listMine: (token, params = {}) => request('/service-orders/me', { method: 'GET', token, params }),
};

export const messagesApi = {
  list: (token, serviceOrderId, params = {}) =>
    request(`/service-orders/${serviceOrderId}/messages`, { method: 'GET', token, params }),
  send: (token, serviceOrderId, payload) =>
    request(`/service-orders/${serviceOrderId}/messages`, { method: 'POST', token, body: payload }),
};

export const paymentsApi = {
  create: (token, payload) => request('/payments', { method: 'POST', token, body: payload }),
};
