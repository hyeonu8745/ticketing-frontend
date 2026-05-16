// src/pages/admin/AdminEventsPage.js
import React, { useEffect, useState } from 'react';
import { fetchAdminEvents, hideEvent, showEvent, updateAdminEvent } from '../../api/adminApi';

const fmt = (n) => Number(n).toLocaleString();
const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function AdminEventsPage() {
  const [keyword, setKeyword] = useState('');
  const [searched, setSearched] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // editing event id
  const [editForm, setEditForm] = useState({ title: '', location: '', description: '' });

  const load = async (p = page, kw = searched) => {
    setLoading(true);
    try {
      const res = await fetchAdminEvents(p, 15, kw);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0, ''); }, []);

  const handleSearch = () => {
    setPage(0);
    setSearched(keyword);
    load(0, keyword);
  };

  const handleToggleVisible = async (event) => {
    const action = event.visible ? '숨김' : '표시';
    if (!window.confirm(`"${event.title}" 공연을 ${action} 처리할까요?`)) return;
    try {
      if (event.visible) {
        await hideEvent(event.id);
      } else {
        await showEvent(event.id);
      }
      await load();
    } catch (e) {
      alert('처리 실패: ' + (e.response?.data || e.message));
    }
  };

  const openEdit = (event) => {
    setEditing(event.id);
    setEditForm({
      title: event.title || '',
      location: event.location || '',
      description: event.description || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateAdminEvent(editing, editForm);
      setEditing(null);
      await load();
    } catch (e) {
      alert('수정 실패: ' + (e.response?.data || e.message));
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0a0a0a', margin: '0 0 8px' }}>
        공연 관리
      </h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
        부적절하거나 잠시 내려야 할 공연은 <strong>숨김 처리</strong>로 사용자에게 노출되지 않게 할 수 있어요.
      </p>

      {/* ── 검색 ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="공연명 또는 장소로 검색"
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

      {/* ── 테이블 ── */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ebebeb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #ebebeb' }}>
              <th style={th}>ID</th>
              <th style={{ ...th, textAlign: 'left' }}>공연명</th>
              <th style={th}>카테고리</th>
              <th style={th}>공연일</th>
              <th style={th}>예매 / 잔여</th>
              <th style={th}>상태</th>
              <th style={th}>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>불러오는 중...</td></tr>
            ) : (data?.content || []).length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>검색 결과가 없습니다.</td></tr>
            ) : data.content.map(ev => (
              <tr key={ev.id} style={{ borderBottom: '1px solid #f5f5f5', opacity: ev.visible ? 1 : 0.5 }}>
                <td style={td}>{ev.id}</td>
                <td style={{ ...td, textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', color: '#0a0a0a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                    {ev.title}
                  </p>
                  <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{ev.location}</p>
                </td>
                <td style={td}>{ev.category}</td>
                <td style={td}>{formatDate(ev.startTime)}</td>
                <td style={td}>
                  <span style={{ fontWeight: '700' }}>{fmt(ev.reservedSeats)}</span>
                  <span style={{ color: '#bbb' }}> / {fmt(ev.totalSeats)}</span>
                </td>
                <td style={td}>
                  {ev.visible ? (
                    <span style={badge('#dcfce7', '#15803d')}>공개</span>
                  ) : (
                    <span style={badge('#fee2e2', '#b91c1c')}>숨김</span>
                  )}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button onClick={() => openEdit(ev)} style={smallBtn('#fff', '#666', '#e5e5e5')}>수정</button>
                    <button
                      onClick={() => handleToggleVisible(ev)}
                      style={smallBtn(
                        ev.visible ? '#fff' : '#0a0a0a',
                        ev.visible ? '#dc2626' : '#fff',
                        ev.visible ? '#ffd0d0' : '#0a0a0a'
                      )}
                    >{ev.visible ? '숨기기' : '다시 표시'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 페이징 ── */}
      {data && data.totalPages > 1 && (
        <Pagination page={page} totalPages={data.totalPages} onChange={(p) => { setPage(p); load(p); }} />
      )}

      {/* ── 수정 모달 ── */}
      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px', color: '#0a0a0a' }}>
            공연 정보 수정
          </h2>
          <FormField
            label="공연명"
            value={editForm.title}
            onChange={(v) => setEditForm({ ...editForm, title: v })}
          />
          <FormField
            label="장소"
            value={editForm.location}
            onChange={(v) => setEditForm({ ...editForm, location: v })}
          />
          <FormField
            label="설명"
            value={editForm.description}
            onChange={(v) => setEditForm({ ...editForm, description: v })}
            multiline
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={() => setEditing(null)} style={modalBtn('#fff', '#666', '#e5e5e5')}>취소</button>
            <button onClick={handleSaveEdit} style={modalBtn('#0a0a0a', '#fff', '#0a0a0a')}>저장</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── 스타일 헬퍼 ──
const th = { padding: '14px 12px', fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '0.5px', textAlign: 'center' };
const td = { padding: '14px 12px', textAlign: 'center', color: '#333' };
const badge = (bg, color) => ({
  display: 'inline-block', padding: '3px 10px', background: bg, color,
  borderRadius: '50px', fontSize: '11px', fontWeight: '800',
});
const smallBtn = (bg, color, border) => ({
  padding: '5px 12px', background: bg, color, border: `1px solid ${border}`,
  borderRadius: '50px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
});
const modalBtn = (bg, color, border) => ({
  padding: '10px 20px', background: bg, color, border: `1px solid ${border}`,
  borderRadius: '50px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit',
});

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', padding: '28px', borderRadius: '14px',
        width: '90%', maxWidth: '480px', maxHeight: '85vh', overflow: 'auto',
      }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, multiline }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '0.5px', marginBottom: '6px' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          style={{
            width: '100%', padding: '11px', border: '1px solid #e5e5e5',
            borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', padding: '11px', border: '1px solid #e5e5e5',
            borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '20px' }}>
      <button onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} style={pageBtn(false)}>‹</button>
      {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
        <button key={i} onClick={() => onChange(i)} style={pageBtn(i === page)}>{i + 1}</button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} style={pageBtn(false)}>›</button>
    </div>
  );
}
const pageBtn = (active) => ({
  minWidth: '32px', padding: '6px 10px', background: active ? '#0a0a0a' : '#fff',
  color: active ? '#fff' : '#666', border: '1px solid #e5e5e5',
  borderRadius: '8px', fontSize: '12px', fontWeight: active ? '800' : '600',
  cursor: 'pointer', fontFamily: 'inherit',
});

export default AdminEventsPage;
