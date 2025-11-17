import { request } from './client';

export const authApi = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { method: 'GET', token }),
};

export const usersApi = {
  updateProfile: (token, payload) => request('/users/me', { method: 'PUT', token, body: payload }),
};

export const professionalsApi = {
  search: (params = {}) => request('/professionals', { params }),
  searchAdvanced: (params = {}) => request('/professionals/search/advanced', { params }),
  getById: (id) => request(`/professionals/${id}`, { method: 'GET' }),
  getByUserId: (userId, token) => request(`/professionals/by-user/${userId}`, { method: 'GET', token }),
  create: (token, payload) => request('/professionals', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => request(`/professionals/${id}`, { method: 'PUT', token, body: payload }),
};

export const reviewsApi = {
  listByProfessional: (professionalId, params = {}) =>
    request('/reviews', { params: { professionalId, ...params } }),
  create: (token, payload) =>
    request('/reviews', { method: 'POST', token, body: payload }),
  update: (token, reviewId, payload) =>
    request(`/reviews/${reviewId}`, { method: 'PUT', token, body: payload }),
  delete: (token, reviewId) =>
    request(`/reviews/${reviewId}`, { method: 'DELETE', token }),
  checkIfUserReviewed: (token, professionalId) =>
    request('/reviews/check', { method: 'GET', token, params: { professionalId } }),
  getUserReview: (token, professionalId) =>
    request('/reviews/user-review', { method: 'GET', token, params: { professionalId } }),
};

export const reviewRepliesApi = {
  create: (token, payload) =>
    request('/review-replies', { method: 'POST', token, body: payload }),
  update: (token, replyId, payload) =>
    request(`/review-replies/${replyId}`, { method: 'PUT', token, body: payload }),
  delete: (token, replyId) =>
    request(`/review-replies/${replyId}`, { method: 'DELETE', token }),
  getByReviewId: (reviewId) =>
    request(`/review-replies/by-review/${reviewId}`, { method: 'GET' }),
  checkIfHasReply: (reviewId) =>
    request(`/review-replies/check/${reviewId}`, { method: 'GET' }),
};

export const serviceOrdersApi = {
  create: (token, payload) => request('/service-orders', { method: 'POST', token, body: payload }),
  getById: (token, id) => request(`/service-orders/${id}`, { method: 'GET', token }),
  listMine: (token, params = {}) => request('/service-orders/me', { method: 'GET', token, params }),
  listForProfessional: (token, professionalId, params = {}) =>
    request(`/service-orders/professional/${professionalId}`, { method: 'GET', token, params }),
};

export const messagesApi = {
  list: (token, serviceOrderId, params = {}) =>
    request(`/service-orders/${serviceOrderId}/messages`, { method: 'GET', token, params }),
  send: (token, serviceOrderId, payload) =>
    request(`/service-orders/${serviceOrderId}/messages`, { method: 'POST', token, body: payload }),
  deleteAll: (token, serviceOrderId) =>
    request(`/service-orders/${serviceOrderId}/messages`, { method: 'DELETE', token }),
};

export const paymentsApi = {
  create: (token, payload) => request('/payments', { method: 'POST', token, body: payload }),
};

export const pricedServicesApi = {
  listByProfessional: (professionalId) =>
    request(`/professionals/${professionalId}/services`, { method: 'GET' }),

  getAllTrades: () =>
    request('/trades', { method: 'GET' }),

  getServicesByTrade: () =>
    request('/services-by-trade', { method: 'GET' }),

  create: (token, payload) =>
    request('/priced-services', { method: 'POST', token, body: payload }),

  update: (token, serviceId, payload) =>
    request(`/priced-services/${serviceId}`, { method: 'PUT', token, body: payload }),

  remove: (token, serviceId) =>
    request(`/priced-services/${serviceId}`, { method: 'DELETE', token }),
};
