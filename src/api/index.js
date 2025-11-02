import { request } from './client';

export const authApi = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { method: 'GET', token }),
};

export const usersApi = {
  updateProfile: (token, payload) => request('/api/users/me', { method: 'PUT', token, body: payload }),
};

export const professionalsApi = {
  search: (params = {}) => request('/api/professionals', { params }),
  getById: (id) => request(`/api/professionals/${id}`, { method: 'GET' }),
  getByUserId: (userId, token) => request(`/api/professionals/by-user/${userId}`, { method: 'GET', token }),
  create: (token, payload) => request('/api/professionals', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => request(`/api/professionals/${id}`, { method: 'PUT', token, body: payload }),
};

export const reviewsApi = {
  listByProfessional: (professionalId, params = {}) =>
    request('/api/reviews', { params: { professionalId, ...params } }),
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
  create: (token, payload) => request('/api/payments', { method: 'POST', token, body: payload }),
};
