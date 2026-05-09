// src/api/paymentApi.js
import API from './index';

/**
 * 좌석 예매 요청
 * 백엔드 ReservationController의 @PostMapping 주소와 매칭
 */
export const createReservation = async (eventId, seatId) => {
  try {
    // 🌟 @RequestParam 방식이므로 주소 뒤에 ?eventId=..&seatId=.. 가 붙도록 params 설정
    const response = await API.post(`/api/reservations`, null, {
      params: {
        eventId: eventId,
        seatId: seatId
      }
    });
    
    // 성공 시 "🎉 예매 성공!" 문자열 반환
    return response.data; 
  } catch (error) {
    // 서버에서 throw한 RuntimeException 메시지(이미 예약된 좌석 등)를 추출
    const errorMsg = error.response?.data || "예매 처리 중 오류가 발생했습니다.";
    console.error("Reservation Error:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getMyReservations = async () => {
  try {
    // GET /api/reservations 호출 (토큰은 인터셉터에서 자동 삽입)
    const response = await API.get('/api/reservations');
    return response.data; // List<ReservationResponse> 반환
  } catch (error) {
    console.error("내 예약 내역을 불러오는데 실패했습니다.", error);
    throw error;
  }
};

// 예매 취소 요청
export const cancelReservation = async (reservationId) => {
  try {
    const response = await API.delete(`/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data || "취소 처리 중 오류가 발생했습니다.";
    throw new Error(errorMsg);
  }
};

export const changeSeat = async (reservationId, newSeatId) => {
  try {
    const response = await API.put(`/api/reservations/${reservationId}/seats/${newSeatId}`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data || "좌석 변경 중 오류가 발생했습니다.";
    throw new Error(errorMsg);
  }
};

