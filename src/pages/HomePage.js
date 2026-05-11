// src/pages/HomePage.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchEvents } from '../api/eventApi';
import EventCard from '../components/EventCard';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import banner1 from '../assets/banner1.png';
import banner2 from '../assets/banner2.png';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/banner4.png';
import banner5 from '../assets/banner5.png';
import banner6 from '../assets/banner6.png';
import banner7 from '../assets/banner7.png';
import banner8 from '../assets/banner8.png';
import banner9 from '../assets/banner9.png';
import banner10 from '../assets/banner10.png';
import '../App.css';

const CATEGORIES = [
  { id: 'ALL', label: '전체' },
  { id: 'CONCERT', label: '콘서트' },
  { id: 'MUSICAL', label: '뮤지컬' },
  { id: 'THEATER', label: '연극' },
  { id: 'VISIT', label: '내한공연' },
];

// 🌟 각 배너별 최적화 비율: 1, 2번은 확대를 조금 더 줄이기 위해 60%, 나머지는 65~70%로 글씨가 안 잘리는 선에서 조절했습니다.
const CUSTOM_BANNERS = [
  { image: banner1,  eventId: 601,  title: 'baby selects, RAVE Fest pt.2: Brutalismus 3000 내한공연', width: '50%' }, 
  { image: banner2,  eventId: 1077, title: '다니엘 시저 내한공연 [고양]', width: '50%' }, 
  { image: banner3,  eventId: 416,  title: 'BTS WORLD TOUR: ARIRANG [부산]', width: '70%' },
  { image: banner4,  eventId: 606,  title: '카츠시카 트리오 최초 내한공연 [성남]', width: '50%' },
  { image: banner5,  eventId: 972,  title: 'Tiffany & Co.와 함께하는 임윤찬 & 카메라타 잘츠부르크', width: '60%' },
  { image: banner6,  eventId: 374,  title: 'APF CONCERTS PRESENTS: Enno Cheng Moon Phases 2.0 World Tour [서울]', width: '70%' },
  { image: banner7,  eventId: 767,  title: '빌킨 내한공연: Billkin Feelquency Tour in Seoul', width: '50%' },
  { image: banner8,  eventId: 955,  title: 'HIMEHINA WORLD Tour: LIFETIME is BUBBLIN [서울]', width: '50%' },
  { image: banner9,  eventId: 823,  title: '알레시아 카라 첫 단독 내한공연 ALESSIA CARA LIVE IN SEOUL', width: '55%' },
  { image: banner10, eventId: 81,   title: '마리아 킴 재즈 콘서트: Summer Jazz Night [울산]', width: '55%' },
];

const dedupeById = (list) => {
  const seen = new Set();
  return list.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const toHttps = (url) => {
  if (!url) return '';
  if (url.startsWith('/api/proxy/')) {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
  }
  return url.replace(/^http:\/\//i, 'https://');
};

function RankSection({ title, events, navigate }) {
  const ref = useRef(null);

  useEffect(() => {
    // 약간의 지연(50ms)을 주어 브라우저 렌더링 및 네이티브 스크롤 복원 기능이 완전히 끝난 후 0으로 덮어씌움
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.scrollLeft = 0;
      }
    }, 50); 
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, [events]);

  const scroll = (dir) => ref.current?.scrollBy({ left: dir === 'left' ? -540 : 540, behavior: 'smooth' });
  
  if (!events.length) return null;
  
  return (
    <div style={{ marginBottom: '48px' }}>
      <div className="section-title">{title}</div>
      <div style={{ position: 'relative' }}>
        <button className="scroll-arrow-btn left" onClick={() => scroll('left')}>❮</button>
        <div ref={ref} className="hide-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', paddingLeft: '24px', paddingRight: '24px', scrollSnapType: 'x mandatory' }}>
          {events.map((event, idx) => (
            <div key={`${title}-${event.id}`} style={{ width: '160px', flexShrink: 0, scrollSnapAlign: 'start' }}>
              <EventCard event={event} rank={idx + 1} />
            </div>
          ))}
        </div>
        <button className="scroll-arrow-btn right" onClick={() => scroll('right')}>❯</button>
      </div>
    </div>
  );
}

function HomePage() {
  const [allEvents, setAllEvents] = useState([]);
  const [gridEvents, setGridEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerColor, setBannerColor] = useState('10, 10, 10');
  const [isDarkBg, setIsDarkBg] = useState(true);

  const [gridPage, setGridPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [bannerPool, setBannerPool] = useState([]);
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const observer = useRef();
  const isNewCategory = useRef(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    fetchEvents(0, 100, '', '').then(data => {
      setAllEvents(dedupeById(data.content || data));
    }).catch(() => {});

    fetchEvents(0, 50, 'VISIT', '').then(data => {
      setBannerPool(dedupeById(data.content || data));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const categoryParam = activeCategory === 'ALL' ? '' : activeCategory;
    fetchEvents(gridPage, 12, categoryParam, '')
      .then(data => {
        const newEvents = data.content || data;
        if (gridPage === 0 || isNewCategory.current) {
          setGridEvents(dedupeById(newEvents));
          isNewCategory.current = false;
        } else {
          setGridEvents(prev => dedupeById([...prev, ...newEvents]));
        }
        setHasMore(data.last !== undefined ? !data.last : newEvents.length === 12);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gridPage, activeCategory]);

  const isVisit   = (e) => e.category === '내한공연' || e.category === 'VISIT';
  const isConcert = (e) => e.category === '콘서트'   || e.category === 'CONCERT';
  const isMusical = (e) => e.category === '뮤지컬'   || e.category === 'MUSICAL';
  const isTheater = (e) => e.category === '연극'     || e.category === 'THEATER';

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex(prev => (prev + 1) % CUSTOM_BANNERS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // 🌟 [수정된 로직] 일반 공연과 내한공연 데이터를 모두 합치고 중복을 제거한 totalEvents 생성
  const totalEvents = dedupeById([...allEvents, ...bannerPool]);

  // 🌟 합쳐진 전체 데이터(totalEvents)를 기준으로 인기 순위 재계산
  const rankAll = [...totalEvents].sort((a, b) => a.remainingSeats - b.remainingSeats).slice(0, 10);
  const rankConcert = allEvents.filter(isConcert).sort((a, b) => a.remainingSeats - b.remainingSeats).slice(0, 10);
  const rankMusical = allEvents.filter(isMusical).sort((a, b) => a.remainingSeats - b.remainingSeats).slice(0, 10);
  const rankTheater = allEvents.filter(isTheater).sort((a, b) => a.remainingSeats - b.remainingSeats).slice(0, 10);
  const rankVisit   = totalEvents.filter(isVisit).sort((a, b) => a.remainingSeats - b.remainingSeats).slice(0, 10);

  const isInGrid = useRef(false);
  const lastEventRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && isInGrid.current) setGridPage(p => p + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleCategoryChange = useCallback((cat) => {
    if (activeCategory !== cat) {
      isNewCategory.current = true;
      setActiveCategory(cat);
      setHasMore(true);
      setGridPage(0);
    }
  }, [activeCategory]);

  const handleLogout = () => { localStorage.removeItem('token'); window.location.reload(); };
  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchTerm.trim())
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const bannerEvent = CUSTOM_BANNERS[bannerIndex];

  // 🌟 색상 평균화 로직 (포스터 왼쪽 영역 추출)
  useEffect(() => {
    if (!bannerEvent?.image) return;
    const img = new Image();
    img.src = bannerEvent.image;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100; canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const data = ctx.getImageData(0, 0, 20, 100).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        setBannerColor(`${r}, ${g}, ${b}`);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        setIsDarkBg(brightness < 140);
      } catch (e) { 
        setBannerColor('10, 10, 10'); 
        setIsDarkBg(true);
      }
    };
    img.onerror = () => {
      setBannerColor('10, 10, 10');
      setIsDarkBg(true);
    };
  }, [bannerEvent]);

  // 🌟 [수정된 로직] 합쳐진 전체 데이터(totalEvents)에서 매진 임박 TOP 3 추출
  const promoEvents = totalEvents
    .filter(e => e.remainingSeats > 0)
    .sort((a, b) => a.remainingSeats - b.remainingSeats)
    .slice(0, 3);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>

      {/* ── 네비게이션 ── */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src={logo} alt="DEAR TICKET" onClick={() => navigate('/')}
            style={{ height: '36px', cursor: 'pointer', userSelect: 'none', objectFit: 'contain' }} />
          <div style={{ flex: 1, maxWidth: '380px', margin: '0 28px', position: 'relative' }}>
            <input className="vivid-input" placeholder="공연, 아티스트, 장소 검색" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} onKeyDown={handleSearch} style={{ paddingRight: '44px' }} />
            <button onClick={handleSearch} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '16px' }}>🔍</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isLoggedIn ? (
              <>
                <button className="nav-btn" onClick={() => navigate('/mypage')}>마이페이지</button>
                <button className="nav-btn" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                로그인
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── 🌟 커스텀 배너 ── */}
      <div style={{ width: '100%', background: `rgb(${bannerColor})`, transition: 'background 0.6s ease' }}>
        <div style={{ position: 'relative', width: '100%', height: '520px', overflow: 'hidden', cursor: 'pointer' }}
          onClick={() => navigate(`/events/${bannerEvent.eventId}`)}>

          {/* 1. 기본 배경 색상 */}
          <div style={{ position: 'absolute', inset: 0, background: `rgb(${bannerColor})`, transition: 'background 0.6s ease', zIndex: 0 }} />

          {/* 2. 🌟 오른쪽 배너 이미지 + CSS Mask를 결합하여 완벽한 블렌딩 구현 */}
          <img src={bannerEvent.image} alt={bannerEvent.title}
            style={{ 
              position: 'absolute', 
              right: 0, 
              top: 0, 
              height: '100%', 
              width: bannerEvent.width, 
              objectFit: 'cover', 
              objectPosition: 'center center', 
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 25%)',
              zIndex: 1 
            }} />

          {/* 3. 왼쪽 텍스트 */}
          <div style={{ position: 'absolute', left: '60px', top: '42%', transform: 'translateY(-50%)', color: isDarkBg ? '#fff' : '#0a0a0a', maxWidth: '400px', zIndex: 3 }}>
            <span style={{ 
              display: 'inline-block', padding: '4px 12px', borderRadius: '4px', 
              background: isDarkBg ? 'rgba(37,99,235,0.85)' : 'rgba(37,99,235,0.15)', 
              color: isDarkBg ? '#fff' : '#2563eb', 
              fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '16px', textTransform: 'uppercase' 
            }}>
              내한공연
            </span>
            <h1 style={{ 
              fontSize: '32px', fontWeight: '900', lineHeight: '1.22', letterSpacing: '-1.5px', marginBottom: '16px', 
              textShadow: isDarkBg ? '0 2px 20px rgba(0,0,0,0.5)' : 'none' 
            }}>
              {bannerEvent.title}
            </h1>
          </div>

          {/* 4. 아이콘 썸네일 바 */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', overflowX: 'auto', padding: '10px 60px 14px', gap: '8px', zIndex: 3 }}
            className="hide-scrollbar">
            {CUSTOM_BANNERS.map((ev, i) => {
              const isActive = i === bannerIndex;
              const borderColor = isActive 
                ? (isDarkBg ? '#fff' : '#0a0a0a') 
                : (isDarkBg ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)');
              const textColor = isActive
                ? (isDarkBg ? '#fff' : '#0a0a0a')
                : (isDarkBg ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)');

              return (
                <div key={i}
                  onMouseEnter={() => setBannerIndex(i)}
                  onClick={e => { e.stopPropagation(); setBannerIndex(i); }}
                  style={{ flexShrink: 0, width: '56px', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', border: `2.5px solid ${borderColor}`, transition: 'all 0.2s', marginBottom: '4px' }}>
                    <img src={ev.image} alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isActive ? 'brightness(1)' : 'brightness(0.4)', transition: 'filter 0.2s' }} />
                  </div>
                  <p style={{ fontSize: '9px', color: textColor, fontWeight: '700', lineHeight: '1.2', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {ev.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="container" style={{ marginTop: '48px' }}>
        <RankSection title="🔥 인기 순위 TOP 10" events={rankAll} navigate={navigate} />
        <RankSection title="🎤 콘서트 인기 순위" events={rankConcert} navigate={navigate} />
        <RankSection title="🎭 뮤지컬 인기 순위" events={rankMusical} navigate={navigate} />
        <RankSection title="🎬 연극 인기 순위" events={rankTheater} navigate={navigate} />
        <RankSection title="✈️ 내한공연 인기 순위" events={rankVisit} navigate={navigate} />

        {/* 카테고리 탭 */}
        <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '30px', marginBottom: '20px' }}>
          <div className="category-tabs" style={{ marginBottom: '0' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 무한 스크롤 그리드 */}
        <div ref={gridRef}
          onMouseEnter={() => { isInGrid.current = true; }}
          onMouseLeave={() => { isInGrid.current = false; }}
          style={{ borderRadius: '12px', padding: '12px' }}>
          <main className="event-grid" style={{ marginTop: '0' }}>
            {gridEvents.length > 0 ? (
              gridEvents.map((event, idx) =>
                gridEvents.length === idx + 1 ? (
                  <div ref={lastEventRef} key={`grid-${event.id}`}><EventCard event={event} /></div>
                ) : (
                  <EventCard key={`grid-${event.id}`} event={event} />
                )
              )
            ) : !loading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: '36px', marginBottom: '14px' }}>🎭</p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#aaa' }}>해당 카테고리의 공연이 없습니다.</p>
              </div>
            )}
          </main>
          {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="spinner" /></div>}
        </div>
      </div>

      {/* ── 프로모 카드 ── */}
      {promoEvents.length > 0 && (
        <div style={{ background: '#f8faff', borderTop: '1px solid #ebebeb', padding: '40px 0', marginTop: '60px' }}>
          <div className="container">
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb', letterSpacing: '1px', marginBottom: '20px' }}>🎯 지금 놓치면 안 되는 공연</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {promoEvents.map((ev, i) => {
                const labels = ['얼리버드 혜택', '마감임박', '인기급상승'];
                const colors = ['#2563eb', '#ef4444', '#f59e0b'];
                return (
                  <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)}
                    style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '140px', cursor: 'pointer', background: '#0a0a0a' }}>
                    <img src={toHttps(ev.posterUrl)} alt={ev.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'brightness(0.4)', transition: 'filter 0.3s' }}
                      onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.55)'}
                      onMouseOut={e => e.currentTarget.style.filter = 'brightness(0.4)'} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: '18px', left: '20px', right: '20px', color: '#fff' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: colors[i], display: 'block', marginBottom: '5px' }}>{labels[i]}</span>
                      <p style={{ fontSize: '15px', fontWeight: '900', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', marginBottom: '3px' }}>{ev.title}</p>
                      <p style={{ fontSize: '12px', opacity: 0.6 }}>잔여석 {ev.remainingSeats}석 · {ev.priceRange}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

export default HomePage;