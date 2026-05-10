// src/pages/EventDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/index';
import logo from '../assets/logo.png';
import '../App.css';

// 이미지 URL 처리 (프록시 URL 또는 http→https 변환)
const toHttps = (url) => {
  if (!url) return '';
  if (url.startsWith('/api/proxy/')) {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
  }
  return url.replace(/^http:\/\//i, 'https://');
};

function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [forecast, setForecast] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    API.get(`/api/events/${eventId}`)
      .then(res => { setEvent(res.data); setLoading(false); })
      .catch(() => setLoading(false));

    API.get(`/api/events/${eventId}/recommendations`)
      .then(res => { if (res.data?.recommendations) setRecommendations(res.data.recommendations); })
      .catch(() => {});

    API.get(`/api/events/${eventId}/forecast`)
      .then(res => setForecast(res.data))
      .catch(() => {});
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
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>홈으로 돌아가기</button>
    </div>
  );

  const isSoldOut = event.remainingSeats === 0;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src={logo} alt="DEAR TICKET" onClick={() => navigate('/')} style={{ height: '36px', cursor: 'pointer', userSelect: 'none', objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <button className="nav-btn" onClick={() => navigate('/mypage')}>마이페이지</button>
                <button className="nav-btn" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>로그인</button>
            )}
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '40px', paddingBottom: '100px' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 0', marginBottom: '28px', cursor: 'pointer', border: 'none', background: 'none', fontSize: '14px', fontWeight: '600', color: '#888', fontFamily: 'inherit' }}>
          ❮ 돌아가기
        </button>

        <div style={{ display: 'flex', gap: '60px', marginBottom: '72px', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 340px', maxWidth: '100%' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.13)' }}>
              <img
                src={toHttps(event.posterUrl) || 'https://via.placeholder.com/340x460?text=NO+IMAGE'}
                alt={event.title}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '320px' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '50px', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '800', letterSpacing: '0.3px', marginBottom: '14px' }}>
              {event.category || '공연'}
            </span>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0a0a0a', lineHeight: '1.25', letterSpacing: '-1px', marginBottom: '28px' }}>
              {event.title}
            </h1>
            <div style={{ borderTop: '1.5px solid #0a0a0a', paddingTop: '24px', marginBottom: '28px' }}>
              {[
                { label: '장소', value: event.location || '정보 없음' },
                { label: '일시', value: event.startTime ? new Date(event.startTime).toLocaleString('ko-KR') : '추후 공지' },
                { label: '잔여석', value: `${event.remainingSeats ?? 0} / ${event.totalSeats || 0}석`, accent: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', marginBottom: '16px', fontSize: '15px', alignItems: 'flex-start' }}>
                  <span style={{ width: '60px', color: '#aaa', fontWeight: '600', flexShrink: 0 }}>{item.label}</span>
                  <span style={{ color: item.accent ? '#2563eb' : '#1a1a1a', fontWeight: item.accent ? '800' : '600' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '28px', backgroundColor: '#fafafa', borderRadius: '18px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#888' }}>좌석 가격</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', letterSpacing: '-0.5px' }}>{event.priceRange || '정보 없음'}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#bbb', lineHeight: '1.7', marginBottom: '22px', marginTop: '12px' }}>
                ※ DEAR TICKET 대기열 시스템이 적용되어 있습니다.<br />
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

              {/* 수요 예측 섹션 */}
              {forecast && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '14px', lineHeight: '1.6' }}>{forecast.insight}</p>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#888' }}>현재 예매율</span>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: '#2563eb' }}>{forecast.reservationRate}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#ebebeb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${forecast.reservationRate}%`, height: '100%', background: forecast.reservationRate >= 80 ? '#ef4444' : forecast.reservationRate >= 50 ? '#f59e0b' : '#2563eb', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  {forecast.soldOutPrediction && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fff1f2', borderRadius: '10px', marginBottom: '14px' }}>
                      <span>🔴</span>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', marginBottom: '2px' }}>매진 예측</p>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: '#333' }}>{forecast.soldOutPrediction}</p>
                      </div>
                    </div>
                  )}
                  {forecast.hourlyDemands && forecast.hourlyDemands.length > 0 && (
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '8px' }}>시간대별 예매 혼잡도</p>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '56px' }}>
                        {forecast.hourlyDemands.map((h, i) => {
                          const colorMap = { LOW: '#93c5fd', MEDIUM: '#60a5fa', HIGH: '#f59e0b', VERY_HIGH: '#ef4444' };
                          const heightMap = { LOW: '25%', MEDIUM: '50%', HIGH: '75%', VERY_HIGH: '100%' };
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                              <div title={`${h.hour} ${h.label}`} style={{ width: '100%', height: heightMap[h.level] || '25%', background: colorMap[h.level] || '#93c5fd', borderRadius: '3px 3px 0 0' }} />
                              <span style={{ fontSize: '8px', color: '#bbb', fontWeight: '600', whiteSpace: 'nowrap' }}>{h.hour}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', justifyContent: 'flex-end' }}>
                        {[['#93c5fd', '여유'], ['#60a5fa', '보통'], ['#f59e0b', '혼잡'], ['#ef4444', '매우혼잡']].map(([color, label]) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                            <span style={{ fontSize: '10px', color: '#bbb', fontWeight: '600' }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 공연 정보 탭 */}
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

        {/* AI 추천 섹션 */}
        {recommendations.length > 0 && (
          <section style={{ marginTop: '80px', paddingTop: '52px', borderTop: '1px solid #ebebeb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0a0a0a', letterSpacing: '-0.5px' }}>이런 공연은 어떠세요?</span>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', border: '1px solid #dbeafe', padding: '3px 10px', borderRadius: '50px' }}>✦ AI 추천</span>
            </div>
            <p style={{ fontSize: '13px', color: '#aaa', fontWeight: '500', marginBottom: '28px' }}>
              {isLoggedIn ? '예매 내역과 선호 카테고리를 분석했어요.' : '현재 공연과 유사한 공연이에요.'}
            </p>
            <div style={{ position: 'relative' }}>
              <button onClick={() => document.getElementById('rec-slider').scrollBy({ left: -540, behavior: 'smooth' })} className="scroll-arrow-btn left" style={{ top: '38%' }}>❮</button>
              <div id="rec-slider" className="hide-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', scrollSnapType: 'x mandatory' }}>
                {recommendations.map(rec => {
                  const isSoldOutRec = rec.remainingSeats === 0;
                  const isAlmostRec = !isSoldOutRec && rec.totalSeats > 0 && (rec.remainingSeats / rec.totalSeats) < 0.15;
                  return (
                    <div key={rec.id} onClick={() => navigate(`/events/${rec.id}`)} style={{ width: '160px', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' }} className="event-card">
                      <div style={{ position: 'relative', width: '100%', paddingTop: '133%', borderRadius: '12px', overflow: 'hidden', background: '#f0f0f0', marginBottom: '10px' }}>
                        <img
                          src={toHttps(rec.posterUrl) || 'https://via.placeholder.com/160x213?text=NO+IMAGE'}
                          alt={rec.title}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        {isSoldOutRec && <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>매진</div>}
                        {isAlmostRec && <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(37,99,235,0.92)', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>마감임박</div>}
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a0a', lineHeight: '1.35', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '36px' }}>{rec.title}</p>
                      <p style={{ fontSize: '11px', color: '#aaa', fontWeight: '600', marginBottom: '2px' }}>{rec.category}</p>
                      {rec.priceRange && <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>{rec.priceRange}</p>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => document.getElementById('rec-slider').scrollBy({ left: 540, behavior: 'smooth' })} className="scroll-arrow-btn right" style={{ top: '38%' }}>❯</button>
            </div>
          </section>
        )}
      </div>

      {/* ── 푸터 ── */}
      <footer style={{ background: '#0a0a0a', color: '#555', padding: '52px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '60px', paddingBottom: '36px', borderBottom: '1px solid #1e1e1e' }}>
            <div style={{ flex: '0 0 200px' }}>
              <img src={logo} alt="DEAR TICKET" style={{ height: '28px', marginBottom: '14px', objectFit: 'contain' }} />
              <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.8' }}>
                고가용성 분산 락 티켓팅 시스템<br />
                © 2026 DEAR TICKET.<br />All Rights Reserved.
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
                오픈소스 및 데이터 출처 / References
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 32px' }}>
                {[
                  { name: 'KOPIS 공연예술통합전산망', desc: '공연 데이터 제공 — 한국문화예술위원회', url: 'https://www.kopis.or.kr' },
                  { name: 'Hamilton, W. et al. (2017)', desc: 'Inductive Representation Learning on Large Graphs (GraphSAGE). NeurIPS 2017.', url: 'https://arxiv.org/abs/1706.02216' },
                  { name: 'Yao et al. (2023)', desc: 'RALLRec: Improving Sequential Recommendation via LLM. arXiv:2312.02445.', url: 'https://arxiv.org/abs/2312.02445' },
                  { name: 'Rasul et al. (2024)', desc: 'Lag-Llama: Towards Foundation Models for Probabilistic Time Series Forecasting. arXiv:2310.08278.', url: 'https://arxiv.org/abs/2310.08278' },
                  { name: 'Team, G. et al. (2024)', desc: 'Gemma: Open Models Based on Gemini Research. arXiv:2403.08295.', url: 'https://arxiv.org/abs/2403.08295' },
                  { name: 'Spring Boot', desc: 'Apache License 2.0 — Pivotal Software', url: 'https://spring.io/projects/spring-boot' },
                  { name: 'React', desc: 'MIT License — Meta Platforms, Inc.', url: 'https://react.dev' },
                  { name: 'Redisson', desc: 'Apache License 2.0 — Redisson Ltd.', url: 'https://github.com/redisson/redisson' },
                  { name: 'FastAPI', desc: 'MIT License — Sebastián Ramírez', url: 'https://fastapi.tiangolo.com' },
                  { name: 'PyTorch', desc: 'BSD License — Meta AI Research', url: 'https://pytorch.org' },
                  { name: 'Pretendard', desc: 'MIT License — orioncactus', url: 'https://github.com/orioncactus/pretendard' },
                  { name: 'Prometheus / Grafana', desc: 'Apache License 2.0', url: 'https://prometheus.io' },
                ].map(item => (
                  <div key={item.name}>
                    <a href={item.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: '12px', fontWeight: '700', color: '#666', textDecoration: 'none' }}
                      onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
                      onMouseOut={e => e.currentTarget.style.color = '#666'}>
                      {item.name}
                    </a>
                    <p style={{ fontSize: '10px', color: '#3a3a3a', marginTop: '3px', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#333' }}>
              본 서비스는 졸업 프로젝트 목적으로 제작되었으며, 공연 데이터는 KOPIS API를 통해 제공받습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EventDetailPage;