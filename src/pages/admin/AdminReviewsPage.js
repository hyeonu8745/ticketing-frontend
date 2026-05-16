// src/pages/admin/AdminReviewsPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminReviews, adminDeleteReview } from '../../api/adminApi';

const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function AdminReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0); // 0=전체

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminReviews();
      setReviews(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (r) => {
    if (!window.confirm(
      `[관리자 권한으로 삭제]\n공연: ${r.eventTitle}\n작성자: ${r.userName}\n\n` +
      `이 후기를 삭제하시겠어요? 작성자에게는 알림이 가지 않습니다.`
    )) return;
    try {
      await adminDeleteReview(r.id);
      await load();
    } catch (e) {
      alert('삭제 실패: ' + (e.response?.data || e.message));
    }
  };

  const filtered = useMemo(() => {
    let list = reviews;
    if (ratingFilter > 0) {
      list = list.filter(r => r.rating === ratingFilter);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(r =>
        r.eventTitle?.toLowerCase().includes(kw) ||
        r.content?.toLowerCase().includes(kw) ||
        r.userName?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [reviews, keyword, ratingFilter]);

  const avg = reviews.length === 0 ? 0
    : (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0a0a0a', margin: '0 0 8px' }}>
        후기 관리
      </h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
        부적절하거나 신고된 후기를 삭제할 수 있어요.
      </p>

      {/* ── 요약 ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '14px', border: '1px solid #ebebeb', flex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '1px', marginBottom: '6px' }}>전체 후기</p>
          <p style={{ fontSize: '24px', fontWeight: '900', color: '#0a0a0a' }}>{reviews.length}건</p>
        </div>
        <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '14px', border: '1px solid #ebebeb', flex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '1px', marginBottom: '6px' }}>평균 평점</p>
          <p style={{ fontSize: '24px', fontWeight: '900', color: '#fbbf24' }}>★ {avg}</p>
        </div>
      </div>

      {/* ── 필터 ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="공연명/작성자/내용 검색"
          style={{
            flex: 1, padding: '11px 16px', border: '1px solid #e5e5e5',
            borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(Number(e.target.value))}
          style={{
            padding: '11px 16px', border: '1px solid #e5e5e5', borderRadius: '50px',
            fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: '#fff',
          }}
        >
          <option value={0}>전체 평점</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}점</option>)}
        </select>
      </div>

      {/* ── 리스트 ── */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ebebeb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#bbb' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#bbb' }}>후기가 없습니다.</div>
        ) : filtered.map((r, idx) => (
          <div
            key={r.id}
            style={{
              padding: '20px 24px',
              borderBottom: idx < filtered.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  onClick={() => navigate(`/events/${r.eventId}`)}
                  style={{
                    fontSize: '14px', fontWeight: '800', color: '#0a0a0a',
                    marginBottom: '6px', cursor: 'pointer',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >{r.eventTitle}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '800' }}>
                    {'★'.repeat(r.rating)}<span style={{ color: '#e5e5e5' }}>{'★'.repeat(5 - r.rating)}</span>
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#666' }}>{r.userName}</span>
                  <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '600' }}>
                    {formatDate(r.createdAt)}{r.updatedAt && ' (수정됨)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(r)}
                style={{
                  padding: '6px 14px', background: '#fff', color: '#dc2626',
                  border: '1px solid #ffd0d0', borderRadius: '50px',
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: 'inherit', flexShrink: 0,
                }}
              >삭제</button>
            </div>
            <p style={{
              fontSize: '13px', color: '#444', lineHeight: '1.7',
              whiteSpace: 'pre-wrap', margin: 0, wordBreak: 'break-word',
            }}>{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminReviewsPage;
