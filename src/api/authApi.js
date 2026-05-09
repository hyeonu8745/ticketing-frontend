// src/api/authApi.js
import API from './index'; 

export const login = async (userId, password) => {
  try {
    // 🌟 백엔드가 기다리는 'email' 필드명으로 매핑해서 보냅니다.
    const response = await API.post('/api/users/login', { 
      email: userId, // 👈 현우 님이 입력한 ID를 email 칸에 담아 보냅니다.
      password: password 
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', userId);
    }
    return response.data;
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await API.post('/api/users/signup', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 현재 로그인한 유저 정보 가져오기
export const getUserProfile = async () => {
  try {
    const response = await API.get('/api/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 개인정보 변경 요청
export const updateProfile = async (userData) => {
  try {
    const response = await API.put('/api/users/me', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// src/api/authApi.js 맨 아래에 추가
export const chargePoints = async (amount) => {
  try {
    const response = await API.post(`/api/users/charge`, null, {
      params: { amount: amount }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};