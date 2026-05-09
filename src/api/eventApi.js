// src/api/eventApi.js
import API from './index';

// 🌟 keyword 파라미터가 4번째에 반드시 있어야 합니다!
export const fetchEvents = async (page = 0, size = 12, category = '', keyword = '') => {
  try {
    const categoryQuery = category && category !== 'ALL' ? `&category=${category}` : '';
    // 🌟 검색어가 있으면 URL에 붙여주는 로직
    const keywordQuery = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
    
    // 최종적으로 백엔드에 요청을 보냅니다.
    const response = await API.get(`/api/events?page=${page}&size=${size}${categoryQuery}${keywordQuery}`); 
    return response.data;
  } catch (error) {
    console.error("목록 로드 실패", error);
    return { content: [], last: true }; 
  }
};