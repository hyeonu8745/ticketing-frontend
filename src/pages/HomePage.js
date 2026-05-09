// src/pages/HomePage.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchEvents } from '../api/eventApi';
import EventCard from '../components/EventCard';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const CATEGORIES = [
  { id: 'ALL', label: '전체' },
  { id: 'CONCERT', label: '콘서트' },
  { id: 'MUSICAL', label: '뮤지컬' },
  { id: 'THEATER', label: '연극' },
  { id: 'VISIT', label: '내한공연' },
];

// ✅ 중복 id 제거 헬퍼
const dedupeById = (list) => {
  const seen = new Set();
  return list.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const isNewCategory = useRef(false);
  const isLoggedIn = !!localStorage.getItem('token');

  const lastEventElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(p => p + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleCategoryChange = useCallback((cat) => {
    if (activeCategory !== cat) {
      isNewCategory.current = true;
      setActiveCategory(cat);
      setHasMore(true);
      setPage(0);
    }
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    const categoryParam = activeCategory === 'ALL' ? '' : activeCategory;
    fetchEvents(page, 12, categoryParam, '')
      .then(data => {
        const newEvents = data.content || data;
        if (page === 0 || isNewCategory.current) {
          // ✅ 백엔드에서 같은 id가 중복으로 와도 제거
          setEvents(dedupeById(newEvents));
          isNewCategory.current = false;
        } else {
          // ✅ 기존 events와 합칠 때도 중복 제거
          setEvents(prev => dedupeById([...prev, ...newEvents]));
        }
        setHasMore(data.last !== undefined ? !data.last : newEvents.length === 12);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, activeCategory]);

  const handleLogout = () => { localStorage.removeItem('token'); window.location.reload(); };
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir === 'left' ? -540 : 540, behavior: 'smooth' });
  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchTerm.trim())
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const hotEvents = [...events]
    .sort((a, b) => (a.remainingSeats || 0) - (b.remainingSeats || 0))
    .slice(0, 10);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>

      {/* ─ 네비게이션 ─ */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div onClick={() => navigate('/')} style={{ fontSize: '22px', fontWeight: '900', color: '#ff2351', cursor: 'pointer', letterSpacing: '-2px', userSelect: 'none' }}>
            VIVID HW
          </div>
          <div style={{ flex: 1, maxWidth: '380px', margin: '0 28px', position: 'relative' }}>
            <input className="vivid-input" placeholder="공연, 아티스트, 장소 검색" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} onKeyDown={handleSearch} style={{ paddingRight: '44px' }} />
            <button onClick={handleSearch} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#ff2351', fontSize: '16px' }}>🔍</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isLoggedIn ? (
              <>
                <button className="nav-btn" onClick={() => navigate('/mypage')}>마이페이지</button>
                <button className="nav-btn" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} style={{ background: '#ff2351', color: '#fff', border: 'none', borderRadius: '50px', padding: '9px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.3px' }}>
                로그인
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '28px' }}>

        {/* ─ 히어로 배너 ─ */}
        <section className="hero-banner" style={{ height: '300px', marginBottom: '48px' }}>
          <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
            alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', left: '44px', top: '50%', transform: 'translateY(-50%)', color: '#fff' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2.5px', opacity: 0.65, marginBottom: '12px', textTransform: 'uppercase' }}>Ticket Open Now</p>
            <h1 style={{ fontSize: '30px', fontWeight: '900', lineHeight: '1.22', letterSpacing: '-1px', marginBottom: '12px' }}>VIVID HW<br />TICKET</h1>
            <p style={{ fontSize: '13px', opacity: 0.75, fontWeight: '500' }}>당신의 일상을 더 선명하게</p>
          </div>
        </section>

        {/* ─ 🔥 매진임박 슬라이더 ─ */}
        <div style={{ marginBottom: '52px' }}>
          <div className="section-title">
            🔥 지금 뜨거운 티켓
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#aaa', marginLeft: 'auto' }}>매진임박순</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="scroll-arrow-btn left" onClick={() => scroll('left')}>❮</button>
            {/* ✅ 슬라이더: 좌석 카드 폭을 고정해서 비율 안 깨지게 */}
            <div ref={scrollRef} className="hide-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', scrollSnapType: 'x mandatory' }}>
              {hotEvents.map((event, idx) => (
                <div
                  key={`hot-${event.id}`}                          /* ✅ prefix로 메인 그리드와 key 분리 */
                  style={{ width: '160px', flexShrink: 0, scrollSnapAlign: 'start' }}
                >
                  <EventCard event={event} rank={idx + 1} />
                </div>
              ))}
            </div>
            <button className="scroll-arrow-btn right" onClick={() => scroll('right')}>❯</button>
          </div>
        </div>

        {/* ─ 카테고리 탭 ─ */}
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

        {/* ─ 공연 그리드 ─ */}
        <main className="event-grid" style={{ marginTop: '20px' }}>
          {events.length > 0 ? (
            events.map((event, idx) =>
              events.length === idx + 1 ? (
                <div ref={lastEventElementRef} key={`grid-${event.id}`}><EventCard event={event} /></div>
              ) : (
                <EventCard key={`grid-${event.id}`} event={event} />
              )
            )
          ) : !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: '#ccc' }}>
              <p style={{ fontSize: '36px', marginBottom: '14px' }}>🎭</p>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#aaa' }}>해당 카테고리의 공연이 없습니다.</p>
            </div>
          )}
        </main>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" />
          </div>
        )}
      </div>

      {/* ─ 푸터 ─ */}
      <footer style={{ borderTop: '1px solid #ebebeb', padding: '48px 0', marginTop: '60px' }}>
        <div className="container">
          <p style={{ fontSize: '15px', fontWeight: '900', color: '#555', letterSpacing: '-1px', marginBottom: '8px' }}>VIVID HW</p>
          <p style={{ fontSize: '12px', color: '#bbb', lineHeight: '1.8' }}>
            고가용성 분산 락 티켓팅 시스템 서비스<br />© 2026 VIVID HW. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;