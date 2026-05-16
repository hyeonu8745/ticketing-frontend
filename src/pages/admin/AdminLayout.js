// src/pages/admin/AdminLayout.js
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import API from '../../api/index';
import logo from '../../assets/logo.png';

// JWT payload 디코드 (base64url) — 백엔드와 별개로 프론트에서 즉각 안내용
const decodeRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.role || null;
  } catch {
    return null;
  }
};

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', icon: '📊', end: true },
  { to: '/admin/events', label: '공연 관리', icon: '🎭' },
  { to: '/admin/reservations', label: '예매 관리', icon: '🎫' },
  { to: '/admin/users', label: '회원 관리', icon: '👤' },
  { to: '/admin/reviews', label: '후기 관리', icon: '💬' },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [authorized, setAuthorized] = useState(null);  // null=확인 중, true/false

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    const role = decodeRole();
    if (role !== 'ROLE_ADMIN') {
      setAuthorized(false);
      return;
    }
    // 백엔드 검증을 겸해 /me 호출
    API.get('/api/users/me')
      .then(res => {
        if (res.data?.role === 'ROLE_ADMIN') {
          setMe(res.data);
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => setAuthorized(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (authorized === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <p style={{ fontSize: '64px' }}>🔒</p>
        <p style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a' }}>접근 권한이 없습니다</p>
        <p style={{ fontSize: '14px', color: '#888' }}>관리자만 접근할 수 있는 페이지입니다.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 24px', background: '#0a0a0a', color: '#fff',
            border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'inherit', marginTop: '10px',
          }}
        >홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      {/* ── 사이드바 ── */}
      <aside
        style={{
          width: '240px',
          background: '#0a0a0a',
          color: '#fff',
          padding: '24px 0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid #222' }}>
          <img
            src={logo}
            alt="DEAR TICKET"
            onClick={() => navigate('/')}
            style={{ height: '26px', cursor: 'pointer', filter: 'invert(1) brightness(2)' }}
          />
          <p style={{ fontSize: '10px', fontWeight: '800', color: '#666', letterSpacing: '2px', marginTop: '8px' }}>
            ADMIN CONSOLE
          </p>
        </div>

        <nav style={{ padding: '20px 16px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                color: isActive ? '#0a0a0a' : '#aaa',
                background: isActive ? '#fff' : 'transparent',
                fontSize: '13px',
                fontWeight: isActive ? '800' : '600',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #222' }}>
          <p style={{ fontSize: '11px', color: '#666', fontWeight: '700', marginBottom: '4px' }}>로그인됨</p>
          <p style={{ fontSize: '13px', color: '#fff', fontWeight: '800', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {me?.name || '관리자'}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', padding: '8px', background: '#1a1a1a', color: '#fff',
              border: '1px solid #333', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: '8px',
            }}
          >🏠 메인 홈으로</button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', background: '#1a1a1a', color: '#aaa',
              border: '1px solid #333', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >로그아웃</button>
        </div>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main style={{ flex: 1, padding: '40px 48px', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;