// src/components/MyReviewList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReviews, deleteReview } from '../api/reviewApi';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function MyReviewList() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchMyReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠어요?')) return;
    try {
      await deleteReview(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: '#bbb' }}>불러오는 중...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
        아직 작성한 관람 후기가 없어요.
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {reviews.map(r => (
        <li
          key={r.id}
          style={{
            padding: '18px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                onClick={() => navigate(`/events/${r.eventId}`)}
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#0a0a0a',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >{r.eventTitle}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '800' }}>
                  {'★'.repeat(r.rating)}<span style={{ color: '#e5e5e5' }}>{'★'.repeat(5 - r.rating)}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '600' }}>
                  {formatDate(r.createdAt)}{r.updatedAt && ' (수정됨)'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              style={{
                padding: '5px 12px',
                background: 'transparent',
                color: '#dc2626',
                border: '1px solid #ffd0d0',
                borderRadius: '50px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >삭제</button>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#555',
            lineHeight: '1.6',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {r.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default MyReviewList;
