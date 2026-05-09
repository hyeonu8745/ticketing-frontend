// src/pages/EventDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/index';
import '../App.css';

function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    API.get(`/api/events/${eventId}`)
      .then(res => { setEvent(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleLogout = () => { localStorage.removeItem('token'); window.location.reload(); };

  const renderDescription = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.jpeg|\.png|\.gif))/ig;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <img key={i} src={part} alt="" style={{ width: '100%', maxWidth: '820px', display: 'block', margin: '20px auto', borderRadius: '12px' }} />;
      }
      const clean = part.replace(/\[이미지 안내\]/g, '').trim();
      return clean ? <p key={i} style={{ marginBottom: '16px', whiteSpace: 'pre-wrap', color: '#555', lineHeight: '1.75', fontSize: '15px' }}>{clean}</p> : null;
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!event) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
      <p style={{ fontSize: '48px' }}>🎭</p>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#666' }}>공연 정보를 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#ff2351', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>홈으로 돌아가기</button>
    </div>
  );

  const isSoldOut = event.remainingSeats === 0;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>

      {/* ─ 네비게이션 ─ */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div onClick={() => navigate('/')} style={{ fontSize: '22px', fontWeight: '900', color: '#ff2351', cursor: 'pointer', letterSpacing: '-2px', userSelect: 'none' }}>
            VIVID HW
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <button className="nav-btn" onClick={() => navigate('/mypage')}>마이페이지</button>
                <button className="nav-btn" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} style={{ background: '#ff2351', color: '#fff', border: 'none', borderRadius: '50px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>로그인</button>
            )}
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '40px', paddingBottom: '100px' }}>

        {/* 뒤로가기 */}
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 0', marginBottom: '28px', cursor: 'pointer', border: 'none', background: 'none', fontSize: '14px', fontWeight: '600', color: '#888', fontFamily: 'inherit' }}>
          ❮ 돌아가기
        </button>

        {/* ─ 메인 영역 ─ */}
        <div style={{ display: 'flex', gap: '60px', marginBottom: '72px', flexWrap: 'wrap' }}>

          {/* 포스터 */}
          <div style={{ flex: '0 0 340px', maxWidth: '100%' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.13)' }}>
              <img
                src={event.posterUrl || 'https://via.placeholder.com/340x460?text=NO+IMAGE'}
                alt={event.title}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>

          {/* 정보 */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            {/* 카테고리 pill */}
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '50px', background: '#fff0f3', color: '#ff2351', fontSize: '12px', fontWeight: '800', letterSpacing: '0.3px', marginBottom: '14px' }}>
              {event.category || '공연'}
            </span>

            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0a0a0a', lineHeight: '1.25', letterSpacing: '-1px', marginBottom: '28px' }}>
              {event.title}
            </h1>

            {/* 상세 정보 */}
            <div style={{ borderTop: '1.5px solid #0a0a0a', paddingTop: '24px', marginBottom: '28px' }}>
              {[
                { label: '장소', value: event.location || '정보 없음' },
                { label: '일시', value: event.startTime ? new Date(event.startTime).toLocaleString('ko-KR') : '추후 공지' },
                { label: '잔여석', value: `${event.remainingSeats ?? 0} / ${event.totalSeats || 0}석`, pink: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '0', marginBottom: '16px', fontSize: '15px', alignItems: 'flex-start' }}>
                  <span style={{ width: '60px', color: '#aaa', fontWeight: '600', flexShrink: 0 }}>{item.label}</span>
                  <span style={{ color: item.pink ? '#ff2351' : '#1a1a1a', fontWeight: item.pink ? '800' : '600' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* 가격 + 예매 박스 */}
            <div style={{ padding: '28px', backgroundColor: '#fafafa', borderRadius: '18px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#888' }}>좌석 가격</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#ff2351', letterSpacing: '-0.5px' }}>
                  {event.priceRange || '정보 없음'}
                </span>
              </div>

              <p style={{ fontSize: '12px', color: '#bbb', lineHeight: '1.7', marginBottom: '22px', marginTop: '12px' }}>
                ※ VIVID HW 대기열 시스템이 적용되어 있습니다.<br />
                ※ 예매하기 클릭 시 대기 순서에 따라 순차적으로 입장합니다.
              </p>

              <button
                onClick={() => {
                  if (!isLoggedIn) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }
                  navigate(`/booking/${event.id}`);
                }}
                disabled={isSoldOut}
                className="vivid-button"
                style={{ fontSize: '17px', fontWeight: '900', padding: '18px', borderRadius: '14px' }}
              >
                {isSoldOut ? '매진되었습니다' : '예매하기'}
              </button>
            </div>
          </div>
        </div>

        {/* ─ 공연 정보 탭 ─ */}
        <section>
          <div style={{ borderBottom: '1px solid #ebebeb', display: 'flex', gap: '32px', marginBottom: '40px' }}>
            <div style={{ padding: '14px 2px', borderBottom: '2.5px solid #0a0a0a', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>공연정보</div>
            <div style={{ padding: '14px 2px', color: '#bbb', fontSize: '16px', cursor: 'pointer' }}>관람후기</div>
          </div>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            {event.description ? renderDescription(event.description) : (
              <p style={{ color: '#bbb', padding: '60px 0', textAlign: 'center', fontSize: '15px' }}>상세 공연 정보가 준비 중입니다.</p>
            )}
          </div>
        </section>
      </div>

      {/* ─ 푸터 ─ */}
      <footer style={{ backgroundColor: '#0a0a0a', color: '#555', padding: '52px 0' }}>
        <div className="container">
          <p style={{ fontWeight: '900', fontSize: '16px', color: '#fff', letterSpacing: '-1px', marginBottom: '8px' }}>VIVID HW</p>
          <p style={{ fontSize: '12px', lineHeight: '1.8' }}>
            고가용성 분산 락 티켓팅 시스템 서비스<br />
            <span style={{ opacity: 0.5 }}>© 2026 VIVID HW. All Rights Reserved.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default EventDetailPage;