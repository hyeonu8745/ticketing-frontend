// src/pages/admin/AdminReservationsPage.js
import React, { useEffect, useState } from 'react';
import { fetchAdminReservations, forceCancelReservation } from '../../api/adminApi';

const fmt = (n) => Number(n).toLocaleString();
const formatDateTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function AdminReservationsPage() {
  const [keyword, setKeyword] = useState('');
  const [searched, setSearched] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (p = page, kw = searched, st = status) => {
    setLoading(true);
    try {
      const res = await fetchAdminReservations(p, 20, st, kw);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0, '', ''); }, []);

  const handleSearch = () => {
    setPage(0);
    setSearched(keyword);
    load(0, keyword, status);
  };

  const handleStatusChange = (s) => {
    setStatus(s);
    setPage(0);
    load(0, searched, s);
  };

  const handleCancel = async (r) => {
    if (!window.confirm(
      `[강제 취소]\n${r.userName}(${r.userEmail})님의\n"${r.eventTitle}" 예매를 취소하시겠어요?\n\n` +
      `${fmt(r.price)}원이 사용자 포인트로 환불됩니다.`
    )) return;
    try {
      await forceCancelReservation(r.reservationId);
      alert('예매가 취소되었습니다.');
      await load();
    } catch (e) {
      alert('취소 실패: ' + (e.response?.data || e.message));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0a0a0a', margin: '0 0 8px' }}>
        예매 관리
      </h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
        부정 예매나 환불 요청이 들어왔을 때 관리자가 직접 취소 처리할 수 있어요.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="유저 이메일/이름 또는 공연명"
          style={{
            flex: 1, padding: '11px 16px', border: '1px solid #e5e5e5',
            borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            padding: '11px 16px', border: '1px solid #e5e5e5', borderRadius: '50px',
            fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: '#fff',
          }}
        >
          <option value="">전체 상태</option>
          <option value="CONFIRMED">예매 완료</option>
          <option value="CANCELLED">취소됨</option>
        </select>
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
              <th style={th}>예매ID</th>
              <th style={{ ...th, textAlign: 'left' }}>유저</th>
              <th style={{ ...th, textAlign: 'left' }}>공연</th>
              <th style={th}>좌석</th>
              <th style={th}>금액</th>
              <th style={th}>예매일</th>
              <th style={th}>상태</th>
              <th style={th}>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>불러오는 중...</td></tr>
            ) : (data?.content || []).length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>예매 내역이 없습니다.</td></tr>
            ) : data.content.map(r => (
              <tr key={r.reservationId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={td}>#{r.reservationId}</td>
                <td style={{ ...td, textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', color: '#0a0a0a' }}>{r.userName}</p>
                  <p style={{ fontSize: '11px', color: '#888' }}>{r.userEmail}</p>
                </td>
                <td style={{ ...td, textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    {r.eventTitle}
                  </p>
                </td>
                <td style={td}>
                  <p style={{ fontWeight: '700' }}>{r.seatNumber}</p>
                  <p style={{ fontSize: '11px', color: '#888' }}>{r.seatGrade}</p>
                </td>
                <td style={{ ...td, fontWeight: '700' }}>{fmt(r.price)}원</td>
                <td style={{ ...td, fontSize: '11px', color: '#666' }}>{formatDateTime(r.reservedAt)}</td>
                <td style={td}>
                  {r.status === 'CONFIRMED' ? (
                    <span style={badge('#dcfce7', '#15803d')}>완료</span>
                  ) : (
                    <span style={badge('#f3f4f6', '#9ca3af')}>취소</span>
                  )}
                </td>
                <td style={td}>
                  {r.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(r)}
                      style={{
                        padding: '5px 12px', background: '#fff', color: '#dc2626',
                        border: '1px solid #ffd0d0', borderRadius: '50px',
                        fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >강제 취소</button>
                  )}
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

export default AdminReservationsPage;
