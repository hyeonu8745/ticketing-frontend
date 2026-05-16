// src/api/adminApi.js
import API from './index';

// ════════════════════════════════════════════════════════════════
// 📊 대시보드
// ════════════════════════════════════════════════════════════════
export const fetchDashboard = async () => {
  const res = await API.get('/api/admin/dashboard');
  return res.data;
};

// ════════════════════════════════════════════════════════════════
// 🎭 공연 관리
// ════════════════════════════════════════════════════════════════
export const fetchAdminEvents = async (page = 0, size = 20, keyword = '') => {
  const q = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
  const res = await API.get(`/api/admin/events?page=${page}&size=${size}${q}`);
  return res.data;
};

export const hideEvent = async (eventId) => {
  const res = await API.patch(`/api/admin/events/${eventId}/hide`);
  return res.data;
};

export const showEvent = async (eventId) => {
  const res = await API.patch(`/api/admin/events/${eventId}/show`);
  return res.data;
};

export const updateAdminEvent = async (eventId, payload) => {
  const res = await API.put(`/api/admin/events/${eventId}`, payload);
  return res.data;
};

// ════════════════════════════════════════════════════════════════
// 🎫 예매 관리
// ════════════════════════════════════════════════════════════════
export const fetchAdminReservations = async (page = 0, size = 20, status = '', keyword = '') => {
  const params = new URLSearchParams({ page, size });
  if (status) params.append('status', status);
  if (keyword) params.append('keyword', keyword);
  const res = await API.get(`/api/admin/reservations?${params}`);
  return res.data;
};

export const forceCancelReservation = async (reservationId) => {
  const res = await API.delete(`/api/admin/reservations/${reservationId}`);
  return res.data;
};

// ════════════════════════════════════════════════════════════════
// 👤 회원 관리
// ════════════════════════════════════════════════════════════════
export const fetchAdminUsers = async (page = 0, size = 20, keyword = '') => {
  const q = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
  const res = await API.get(`/api/admin/users?page=${page}&size=${size}${q}`);
  return res.data;
};

export const changeUserRole = async (userId, role) => {
  const res = await API.patch(`/api/admin/users/${userId}/role?role=${role}`);
  return res.data;
};

// ════════════════════════════════════════════════════════════════
// 💬 후기 관리
// ════════════════════════════════════════════════════════════════
export const fetchAdminReviews = async () => {
  const res = await API.get('/api/admin/reviews');
  return res.data;
};

export const adminDeleteReview = async (reviewId) => {
  const res = await API.delete(`/api/admin/reviews/${reviewId}`);
  return res.data;
};

// ════════════════════════════════════════════════════════════════
// ⚙️ KOPIS 동기화
// ════════════════════════════════════════════════════════════════
export const syncKopis = async (count = 100) => {
  const res = await API.get(`/api/admin/sync?count=${count}`);
  return res.data;
};
