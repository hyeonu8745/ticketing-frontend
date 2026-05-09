// src/api/queueApi.js
import API from './index'; 

// 🌟 POST 요청(enterQueue)은 삭제하거나 아래처럼 GET으로 통합합니다.
export const getQueueStatus = async (eventId) => {
  try {
    // 백엔드 컨트롤러가 @GetMapping("/status")에 eventId를 @RequestParam으로 받습니다.
    const response = await API.get('/api/queue/status', {
      params: { eventId: eventId }
    });
    return response.data; // QueueResponse 반환
  } catch (error) {
    console.error("대기열 상태 확인 실패:", error);
    throw error;
  }
};