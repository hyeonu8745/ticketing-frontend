// src/api/reviewApi.js
import API from './index';

// 공연별 후기 목록 (공개)
export const fetchReviewsByEvent = async (eventId) => {
  try {
    const res = await API.get(`/api/reviews/events/${eventId}`);
    return res.data;
  } catch (e) {
    console.error('후기 목록 조회 실패', e);
    return [];
  }
};

// 공연별 평점 요약 (공개)
export const fetchReviewSummary = async (eventId) => {
  try {
    const res = await API.get(`/api/reviews/events/${eventId}/summary`);
    return res.data;
  } catch (e) {
    return { eventId, totalCount: 0, averageRating: 0 };
  }
};

// 작성 가능 여부 (인증) — 비로그인 시 401 반환되므로 호출 측에서 토큰 체크
export const checkReviewEligibility = async (eventId) => {
  try {
    const res = await API.get(`/api/reviews/events/${eventId}/eligibility`);
    return res.data;
  } catch (e) {
    return { eligible: false, alreadyWritten: false, reason: '로그인이 필요합니다.' };
  }
};

// 후기 작성
export const createReview = async (eventId, { rating, content }) => {
  try {
    const res = await API.post(`/api/reviews/events/${eventId}`, { rating, content });
    return res.data;
  } catch (e) {
    const msg = e.response?.data || '후기 작성에 실패했습니다.';
    throw new Error(typeof msg === 'string' ? msg : '후기 작성에 실패했습니다.');
  }
};

// 후기 수정
export const updateReview = async (reviewId, { rating, content }) => {
  try {
    const res = await API.put(`/api/reviews/${reviewId}`, { rating, content });
    return res.data;
  } catch (e) {
    const msg = e.response?.data || '후기 수정에 실패했습니다.';
    throw new Error(typeof msg === 'string' ? msg : '후기 수정에 실패했습니다.');
  }
};

// 후기 삭제
export const deleteReview = async (reviewId) => {
  try {
    const res = await API.delete(`/api/reviews/${reviewId}`);
    return res.data;
  } catch (e) {
    const msg = e.response?.data || '후기 삭제에 실패했습니다.';
    throw new Error(typeof msg === 'string' ? msg : '후기 삭제에 실패했습니다.');
  }
};

// 내가 쓴 후기 목록
export const fetchMyReviews = async () => {
  try {
    const res = await API.get('/api/reviews/me');
    return res.data;
  } catch (e) {
    console.error('내 후기 조회 실패', e);
    return [];
  }
};
