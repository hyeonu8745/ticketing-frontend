// src/pages/admin/AdminUsersPage.js
import React, { useEffect, useState } from 'react';
import { fetchAdminUsers, changeUserRole } from '../../api/adminApi';

const fmt = (n) => Number(n).toLocaleString();

function AdminUsersPage() {
  const [keyword, setKeyword] = useState('');
  const [searched, setSearched] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (p = page, kw = searched) => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers(p, 20, kw);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 ESLint 경고(Warning) 해결을 위한 주석 추가
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(0, ''); }, []);

  const handleSearch = () => {
    setPage(0);
    setSearched(keyword);
    load(0, keyword);
  };

  const handleRoleChange = async (user) => {
    const newRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    const label = newRole === 'ROLE_ADMIN' ? '관리자로 승격' : '일반 회원으로 강등';
    if (!window.confirm(`${user.name}(${user.email}) 님을 ${label}하시겠어요?`)) return;
    try {
      await changeUserRole(user.id, newRole);
      await load();
    } catch (e) {
      alert('변경 실패: ' + (e.response?.data || e.message));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0a0a0a', margin: '0 0 8px' }}>
        회원 관리
      </h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
        회원 권한을 일반/관리자로 전환할 수 있어요. 자기 자신의 권한은 바꿀 수 없습니다.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="이메일 또는 이름으로 검색"
          style={{
            flex: 1, padding: '11px 16px', border: '1px solid #e5e5e5',
            borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '11px 24px', background: '#0a0a0a', color: '#fff',
            border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: '800',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >검색</button>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ebebeb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #ebebeb' }}>
              <th style={th}>ID</th>
              <th style={{ ...th, textAlign: 'left' }}>이름 / 이메일</th>
              <th style={th}>권한</th>
              <th style={th}>보유 포인트</th>
              <th style={th}>예매 수</th>
              <th style={th}>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>불러오는 중...</td></tr>
            ) : (data?.content || []).length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>회원이 없습니다.</td></tr>
            ) : data.content.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={td}>#{u.id}</td>
                <td style={{ ...td, textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', color: '#0a0a0a' }}>{u.name}</p>
                  <p style={{ fontSize: '11px', color: '#888' }}>{u.email}</p>
                </td>
                <td style={td}>
                  {u.role === 'ROLE_ADMIN' ? (
                    <span style={badge('#fef3c7', '#a16207')}>관리자</span>
                  ) : (
                    <span style={badge('#dbeafe', '#1d4ed8')}>일반</span>
                  )}
                </td>
                <td style={{ ...td, fontWeight: '700' }}>{fmt(u.point)}원</td>
                <td style={td}>{fmt(u.reservationCount)}건</td>
                <td style={td}>
                  <button
                    onClick={() => handleRoleChange(u)}
                    style={{
                      padding: '5px 12px',
                      background: u.role === 'ROLE_ADMIN' ? '#fff' : '#0a0a0a',
                      color: u.role === 'ROLE_ADMIN' ? '#dc2626' : '#fff',
                      border: `1px solid ${u.role === 'ROLE_ADMIN' ? '#ffd0d0' : '#0a0a0a'}`,
                      borderRadius: '50px', fontSize: '11px', fontWeight: '700',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >{u.role === 'ROLE_ADMIN' ? '권한 회수' : '관리자로'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={() => { setPage(Math.max(0, page - 1)); load(Math.max(0, page - 1)); }} disabled={page === 0} style={pageBtn(false)}>‹</button>
          {Array.from({ length: Math.min(data.totalPages, 10) }).map((_, i) => (
            <button key={i} onClick={() => { setPage(i); load(i); }} style={pageBtn(i === page)}>{i + 1}</button>
          ))}
          <button onClick={() => { setPage(Math.min(data.totalPages - 1, page + 1)); load(Math.min(data.totalPages - 1, page + 1)); }} disabled={page >= data.totalPages - 1} style={pageBtn(false)}>›</button>
        </div>
      )}
    </div>
  );
}

const th = { padding: '14px 12px', fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '0.5px', textAlign: 'center' };
const td = { padding: '12px', textAlign: 'center', color: '#333' };
const badge = (bg, color) => ({
  display: 'inline-block', padding: '3px 10px', background: bg, color,
  borderRadius: '50px', fontSize: '11px', fontWeight: '800',
});
const pageBtn = (active) => ({
  minWidth: '32px', padding: '6px 10px', background: active ? '#0a0a0a' : '#fff',
  color: active ? '#fff' : '#666', border: '1px solid #e5e5e5',
  borderRadius: '8px', fontSize: '12px', fontWeight: active ? '800' : '600',
  cursor: 'pointer', fontFamily: 'inherit',
});

export default AdminUsersPage;