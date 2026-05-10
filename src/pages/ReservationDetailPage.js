// src/pages/ReservationDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyReservations } from '../api/paymentApi';
import '../App.css';

function ReservationDetailPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReservations()
      .then(resData => {
        setReservation(resData.find(r => r.reservationId === parseInt(reservationId)) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reservationId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!reservation) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
      <p style={{ fontSize: '36px' }}>🎫</p>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#aaa' }}>예매 정보를 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/mypage')} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
        마이페이지로
      </button>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        <button onClick={() => navigate('/mypage')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', fontWeight: '700', fontFamily: 'inherit' }}>
          ❮ 마이페이지
        </button>

        <div style={{ backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          <div style={{ position: 'relative', height: '200px', background: '#1a1a1a', overflow: 'hidden' }}>
            {reservation.posterUrl && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${reservation.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45 }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', top: '18px', left: '22px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff', letterSpacing: '-1.5px', opacity: 0.9 }}>DEAR TICKET</span>
            </div>
            <div style={{ position: 'absolute', bottom: '22px', left: '22px', right: '22px' }}>
              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px', marginBottom: '8px' }}>
                TICKET
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0, lineHeight: '1.3', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                {reservation.eventTitle}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, width: '20px', height: '20px', borderRadius: '50%', background: '#f0f2f5', marginLeft: '-10px' }} />
            {[...Array(20)].map((_, i) => <div key={i} style={{ flex: 1, height: '1px', background: '#ebebeb', margin: '0 2px' }} />)}
            <div style={{ position: 'absolute', right: 0, width: '20px', height: '20px', borderRadius: '50%', background: '#f0f2f5', marginRight: '-10px' }} />
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '22px', marginBottom: '32px' }}>
              {[
                { label: 'DATE', value: new Date(reservation.reservedAt).toLocaleDateString('ko-KR') },
                { label: 'VENUE', value: reservation.location || '상세 참조' },
                { label: 'SEAT', value: reservation.seatNumber, accent: true },
                { label: 'NO.', value: `#${reservation.reservationId}` },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '10px', fontWeight: '800', color: '#bbb', letterSpacing: '1.5px', marginBottom: '5px' }}>{item.label}</p>
                  <p style={{ fontSize: item.accent ? '22px' : '15px', fontWeight: '900', color: item.accent ? '#2563eb' : '#0a0a0a', letterSpacing: item.accent ? '-0.5px' : '0' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=148x148&data=${reservation.reservationId}&margin=10`}
                alt="QR"
                style={{ width: '148px', height: '148px', display: 'block', margin: '0 auto 14px' }}
              />
              <p style={{ fontSize: '12px', color: '#bbb', fontWeight: '500' }}>입장 시 스태프에게 제시해 주세요.</p>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #ebebeb', padding: '14px', textAlign: 'center', color: '#ccc', fontSize: '11px', fontWeight: '500' }}>
            본 티켓은 1인 1매에 한하여 유효합니다.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => window.print()} style={{ flex: 1, padding: '18px 0', borderRadius: '14px', border: '1px solid #ddd', background: '#fff', color: '#555', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>
            티켓 출력
          </button>
          <button onClick={() => navigate(`/events/${reservation.eventId}/seats`, { state: { isChangeMode: true, oldReservationId: reservation.reservationId } })}
            className="vivid-button" style={{ flex: 1, height: '56px', borderRadius: '14px', fontSize: '14px' }}>
            좌석 변경
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationDetailPage;