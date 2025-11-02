import { request } from './client';

export const authApi = {
  login: (payload) => request('/api/v1/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/api/v1/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/api/v1/auth/me', { method: 'GET', token }),
};

export const usersApi = {
  updateProfile: (token, payload) => request('/api/users/me', { method: 'PUT', token, body: payload }),
};

export const professionalsApi = {
  search: (params = {}) => request('/api/v1/professionals', { params }),
  getById: (id) => request(`/api/v1/professionals/${id}`, { method: 'GET' }),
  getByUserId: (userId, token) => request(`/api/v1/professionals/by-user/${userId}`, { method: 'GET', token }),
  create: (token, payload) => request('/api/v1/professionals', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => request(`/api/v1/professionals/${id}`, { method: 'PUT', token, body: payload }),
};

export const reviewsApi = {
  listByProfessional: (professionalId, params = {}) =>
    request('/api/v1/reviews', { params: { professionalId, ...params } }),
};

export const serviceOrdersApi = {
  create: (token, payload) => request('/api/service-orders', { method: 'POST', token, body: payload }),
  getById: (token, id) => request(`/api/service-orders/${id}`, { method: 'GET', token }),
  listMine: (token, params = {}) => request('/api/service-orders/me', { method: 'GET', token, params }),
};

export const messagesApi = {
  list: (token, serviceOrderId, params = {}) =>
    request(`/api/service-orders/${serviceOrderId}/messages`, { method: 'GET', token, params }),
  send: (token, serviceOrderId, payload) =>
    request(`/api/service-orders/${serviceOrderId}/messages`, { method: 'POST', token, body: payload }),
};

export const paymentsApi = {
  create: (token, payload) => request('/api/v1/payments', { method: 'POST', token, body: payload }),
};
