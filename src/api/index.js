import axios from 'axios';

// 1. Axios 인스턴스 생성
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // 이제 404 없이 백엔드로 직접 찌릅니다.
  timeout: 5000,
});

// 2. [요청 인터셉터] 모든 요청 헤더에 JWT 토큰 삽입
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. [응답 인터셉터] 세션 만료(401) 자동 처리
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login'; // 로그인 페이지로 튕기기
    }
    return Promise.reject(error);
  }
);
console.log("Base URL applied:", instance.defaults.baseURL);
export default instance;