// src/pages/SearchPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchEvents } from '../api/eventApi';
import EventCard from '../components/EventCard';
import '../App.css';

const CATEGORIES = [
  { id: 'ALL', label: '전체보기' },
  { id: 'CONCERT', label: '콘서트' },
  { id: 'MUSICAL', label: '뮤지컬' },
  { id: 'THEATER', label: '연극' },
  { id: 'VISIT', label: '내한공연' },
];
const SORTS = [
  { id: 'RECOMMEND', label: '추천순' },
  { id: 'RECENT', label: '최신순' },
  { id: 'CLOSING', label: '마감임박' },
];

// 중복 제거 헬퍼
const dedupeById = (list) => {
  const seen = new Set();
  return list.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECOMMEND');
  const location = useLocation();
  const navigate = useNavigate();
  const searchTerm = new URLSearchParams(location.search).get('query') || '';

  // ✅ 백엔드에 keyword + category 직접 던져서 검색 (확장 검색은 백엔드가 처리)
  useEffect(() => {
    if (!searchTerm.trim()) { setResults([]); setLoading(false); return; }

    setLoading(true);
    const categoryParam = activeCategory === 'ALL' ? '' : activeCategory;

    // 페이지 0, 사이즈 100으로 충분한 양 가져온 뒤 클라이언트에서 정렬
    fetchEvents(0, 100, categoryParam, searchTerm)
      .then(data => {
        const list = data.content || data || [];
        let sorted = dedupeById(list);

        // 정렬
        if (sortBy === 'RECENT') {
          sorted.sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0));
        } else if (sortBy === 'CLOSING') {
          sorted.sort((a, b) => (a.remainingSeats || 0) - (b.remainingSeats || 0));
        } else {
          sorted.sort((a, b) => b.id - a.id);
        }

        setResults(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchTerm, activeCategory, sortBy]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '20px' }}>
          <div onClick={() => navigate('/')} style={{ fontSize: '22px', fontWeight: '900', color: '#ff2351', cursor: 'pointer', letterSpacing: '-2px', userSelect: 'none', flexShrink: 0 }}>
            VIVID HW
          </div>
          <div style={{ height: '20px', width: '1px', background: '#ebebeb' }} />
          <p style={{ fontSize: '15px', color: '#666', fontWeight: '500' }}>
            '<span style={{ color: '#0a0a0a', fontWeight: '800' }}>{searchTerm}</span>' 검색 결과
          </p>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '40px', display: 'flex', gap: '40px', paddingBottom: '80px' }}>
        {/* 사이드바 */}
        <aside style={{ width: '180px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>카테고리</h3>
          <ul style={{ listStyle: 'none' }}>
            {CATEGORIES.map(cat => (
              <li key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '12px 0', cursor: 'pointer', fontSize: '14px', fontWeight: activeCategory === cat.id ? '800' : '500', color: activeCategory === cat.id ? '#ff2351' : '#666', borderBottom: '1px solid #f5f5f5', transition: 'color 0.15s' }}>
                {cat.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* 메인 */}
        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #ebebeb' }}>
            <span style={{ fontSize: '14px', color: '#aaa', fontWeight: '600' }}>
              총 <b style={{ color: '#0a0a0a' }}>{results.length}</b>개
            </span>
            <div style={{ display: 'flex', border: '1px solid #ebebeb', borderRadius: '8px', overflow: 'hidden' }}>
              {SORTS.map(sort => (
                <button key={sort.id} onClick={() => setSortBy(sort.id)} style={{ padding: '8px 16px', border: 'none', borderRight: '1px solid #ebebeb', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', background: sortBy === sort.id ? '#0a0a0a' : '#fff', color: sortBy === sort.id ? '#fff' : '#888', transition: 'all 0.15s' }}>
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {results.length > 0 ? (
            <div className="event-grid">
              {results.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0', backgroundColor: '#fafafa', borderRadius: '20px' }}>
              <p style={{ fontSize: '44px', marginBottom: '16px' }}>🌵</p>
              <p style={{ color: '#bbb', fontSize: '16px', fontWeight: '700' }}>
                '{searchTerm}'에 대한 검색 결과가 없습니다.
              </p>
              <p style={{ color: '#ddd', fontSize: '13px', marginTop: '8px' }}>
                다른 검색어, 카테고리, 또는 지역명으로 시도해보세요.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchPage;