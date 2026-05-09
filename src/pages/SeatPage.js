// src/pages/SeatPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/index';
import { createReservation, changeSeat } from '../api/paymentApi';
import '../App.css';

const getSeatGrade = (seatNumber) => {
  const row = seatNumber?.charAt(0) || '';
  if (['A', 'B', 'C'].includes(row)) return { label: 'VIP', color: '#C9A84C', bg: '#FFF8E7' };
  if (['D', 'E', 'F', 'G'].includes(row)) return { label: 'R', color: '#6B7280', bg: '#F3F4F6' };
  return { label: 'S', color: '#92623B', bg: '#FDF3E7' };
};

function SeatPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isChangeMode = location.state?.isChangeMode || false;
  const oldReservationId = location.state?.oldReservationId;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/api/events/${eventId}/seats`)
      .then(res => { setSeats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'AVAILABLE') setSelectedSeat(seat);
  };

  const handleReservation = async () => {
    if (!selectedSeat) return;
    try {
      if (isChangeMode) {
        await changeSeat(oldReservationId, selectedSeat.id);
        alert(`${selectedSeat.seatNumber}번으로 좌석 변경이 완료되었습니다!`);
      } else {
        await createReservation(eventId, selectedSeat.id);
      }
      navigate(`/events/${eventId}/success`, { state: { seatNumber: selectedSeat.seatNumber, price: selectedSeat.price, isChangeMode } });
    } catch (error) { alert(error.message); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <nav className="navbar" style={{ backgroundColor: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div onClick={() => navigate('/')} style={{ fontSize: '22px', fontWeight: '900', color: '#ff2351', cursor: 'pointer', letterSpacing: '-2px', userSelect: 'none' }}>VIVID HW</div>
          <button className="nav-btn" onClick={() => navigate('/mypage')}>마이페이지</button>
        </div>
      </nav>

      <div className="container" style={{ padding: '48px 24px 80px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>
          좌석 {isChangeMode ? '변경' : '선택'}
        </h1>
        <p style={{ fontSize: '14px', color: '#aaa', fontWeight: '500', marginBottom: '36px' }}>
          {isChangeMode ? '변경하실 새로운 좌석을 선택해 주세요.' : '원하시는 좌석을 선택해주세요.'}
        </p>

        {/* 범례 */}
        <div style={{ display: 'inline-flex', gap: '20px', backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: '12px', padding: '14px 24px', marginBottom: '36px' }}>
          {[
            { color: '#C9A84C', label: 'VIP석' },
            { color: '#9CA3AF', label: 'R석' },
            { color: '#B8855A', label: 'S석' },
            { color: '#ff2351', label: '선택함' },
            { color: '#e5e5e5', label: '예약됨' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* 스테이지 */}
        <div style={{ width: '480px', height: '36px', background: '#0a0a0a', color: '#fff', margin: '0 auto 44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 0 16px 16px', fontSize: '12px', fontWeight: '800', letterSpacing: '6px' }}>
          STAGE
        </div>

        {/* 좌석 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 48px)', gap: '8px', justifyContent: 'center', margin: '0 auto', maxWidth: '560px', paddingBottom: '52px' }}>
          {seats.map(seat => {
            const isReserved = seat.status === 'RESERVED';
            const isSelected = selectedSeat?.id === seat.id;
            const grade = getSeatGrade(seat.seatNumber);

            return (
              <div
                key={seat.id}
                onClick={() => !isReserved && handleSeatClick(seat)}
                title={`${seat.seatNumber} (${grade.label}석) - ${seat.price?.toLocaleString()}원`}
                style={{
                  width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', borderRadius: '8px', transition: 'all 0.15s',
                  backgroundColor: isSelected ? '#ff2351' : isReserved ? '#e5e5e5' : grade.color + '33',
                  color: isSelected ? '#fff' : isReserved ? '#bbb' : grade.color,
                  border: isSelected ? 'none' : isReserved ? '1px solid #e0e0e0' : `1.5px solid ${grade.color}55`,
                  cursor: isReserved ? 'not-allowed' : 'pointer',
                  transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 14px rgba(255,35,81,0.35)' : 'none',
                }}
              >
                {seat.seatNumber}
              </div>
            );
          })}
        </div>

        {/* 하단 선택 요약 */}
        <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '36px' }}>
          {selectedSeat && (
            <div style={{ display: 'inline-flex', gap: '24px', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: '14px', padding: '18px 32px', marginBottom: '24px', fontSize: '15px' }}>
              <span style={{ color: '#aaa', fontWeight: '600' }}>선택 좌석</span>
              <span style={{ fontWeight: '900', color: '#0a0a0a', fontSize: '18px' }}>{selectedSeat.seatNumber}</span>
              <div style={{ width: '1px', height: '20px', background: '#ebebeb' }} />
              <span style={{ color: '#aaa', fontWeight: '600' }}>결제 금액</span>
              <span style={{ fontWeight: '900', color: '#ff2351', fontSize: '18px' }}>{selectedSeat.price?.toLocaleString()}원</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(isChangeMode ? '/mypage' : `/events/${eventId}`)}
              style={{ padding: '16px 36px', fontSize: '15px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}
            >
              취소
            </button>
            <button
              onClick={handleReservation}
              disabled={!selectedSeat}
              className="vivid-button"
              style={{ width: 'auto', padding: '16px 52px', fontSize: '16px', borderRadius: '12px' }}
            >
              {isChangeMode ? '변경 완료' : '예매하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatPage;