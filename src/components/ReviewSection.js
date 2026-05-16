// src/components/ReviewSection.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchReviewsByEvent,
  fetchReviewSummary,
  checkReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviewApi';

// ──────────────────────────────────────────────
// 별점 표시 컴포넌트 (read-only or interactive)
// ──────────────────────────────────────────────
function StarRating({ value, onChange, size = 18, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = (hover || value) >= n;
        return (
          <span
            key={n}
            onClick={() => !readOnly && onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{
              fontSize: `${size}px`,
              color: filled ? '#fbbf24' : '#e5e5e5',
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'color 0.15s',
              userSelect: 'none',
            }}
          >★</span>
        );
      })}
    </div>
  );
}

// 날짜 포맷
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

function ReviewSection({ eventId, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ totalCount: 0, averageRating: 0 });
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  // 작성/수정 폼 상태
  const [editingId, setEditingId] = useState(null); // null이면 신규작성, 값이 있으면 수정 모드
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  // ──────────────────────────────────────────────
  // 데이터 로드
  // ──────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [list, sum] = await Promise.all([
      fetchReviewsByEvent(eventId),
      fetchReviewSummary(eventId),
    ]);
    setReviews(list);
    setSummary(sum);
    if (isLoggedIn) {
      const el = await checkReviewEligibility(eventId);
      setEligibility(el);
    }
    setLoading(false);
  }, [eventId, isLoggedIn]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ──────────────────────────────────────────────
  // 작성/수정 처리
  // ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formContent.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }
    if (formContent.length > 1000) {
      alert('1000자 이내로 작성해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateReview(editingId, { rating: formRating, content: formContent });
      } else {
        await createReview(eventId, { rating: formRating, content: formContent });
      }
      setShowForm(false);
      setEditingId(null);
      setFormContent('');
      setFormRating(5);
      await loadAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setFormRating(review.rating);
    setFormContent(review.content);
    setShowForm(true);
    // 폼이 위에 있으므로 스크롤 위로
    document.getElementById('review-form-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('정말 삭제하시겠어요?')) return;
    try {
      await deleteReview(reviewId);
      await loadAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleOpenForm = () => {
    // 이미 작성한 후기가 있으면 그것을 수정 모드로
    if (eligibility?.alreadyWritten && eligibility?.existingReviewId) {
      const mine = reviews.find(r => r.id === eligibility.existingReviewId);
      if (mine) {
        handleEdit(mine);
        return;
      }
    }
    setEditingId(null);
    setFormRating(5);
    setFormContent('');
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormContent('');
    setFormRating(5);
  };

  // ──────────────────────────────────────────────
  // 렌더
  // ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
        후기를 불러오는 중...
      </div>
    );
  }

  const canWrite = isLoggedIn && (eligibility?.eligible || eligibility?.alreadyWritten);
  const blockReason = isLoggedIn && !canWrite ? eligibility?.reason : null;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* ── 평점 요약 ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          background: '#fafafa',
          borderRadius: '14px',
          marginBottom: '28px',
          border: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px' }}>
              평균 평점
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#0a0a0a', lineHeight: 1 }}>
                {summary.averageRating.toFixed(1)}
              </span>
              <span style={{ fontSize: '14px', color: '#bbb', fontWeight: '600' }}>/ 5.0</span>
            </div>
          </div>
          <div style={{ height: '40px', width: '1px', background: '#e5e5e5' }} />
          <div>
            <p style={{ fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px' }}>
              총 후기
            </p>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0a0a0a', lineHeight: 1 }}>
              {summary.totalCount}<span style={{ fontSize: '13px', color: '#bbb', fontWeight: '600', marginLeft: '3px' }}>개</span>
            </p>
          </div>
          {summary.totalCount > 0 && (
            <>
              <div style={{ height: '40px', width: '1px', background: '#e5e5e5' }} />
              <StarRating value={Math.round(summary.averageRating)} readOnly size={20} />
            </>
          )}
        </div>

        {!showForm && (
          <button
            onClick={handleOpenForm}
            disabled={!isLoggedIn}
            style={{
              padding: '11px 22px',
              background: isLoggedIn ? '#0a0a0a' : '#e5e5e5',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: isLoggedIn ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {eligibility?.alreadyWritten ? '내 후기 수정' : '후기 작성'}
          </button>
        )}
      </div>

      <div id="review-form-anchor" />

      {/* ── 비로그인 안내 ── */}
      {!isLoggedIn && (
        <div style={{ padding: '14px 20px', background: '#f6f9ff', border: '1px solid #e0eaff', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: '#3b5bdb', fontWeight: '600' }}>
          로그인하면 관람 후기를 작성할 수 있어요.
        </div>
      )}

      {/* ── 작성 권한 안내 ── */}
      {blockReason && !showForm && (
        <div style={{ padding: '14px 20px', background: '#fff8f0', border: '1px solid #ffe4c2', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: '#a66200', fontWeight: '600' }}>
          ⓘ {blockReason}
        </div>
      )}

      {/* ── 작성/수정 폼 ── */}
      {showForm && (
        <div
          style={{
            padding: '24px',
            border: '2px solid #0a0a0a',
            borderRadius: '14px',
            marginBottom: '32px',
            background: '#fff',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#0a0a0a', marginBottom: '16px' }}>
            {editingId ? '후기 수정하기' : '후기 작성하기'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#555' }}>별점</span>
            <StarRating value={formRating} onChange={setFormRating} size={28} />
            <span style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>({formRating}.0)</span>
          </div>

          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="공연은 어떠셨나요? 다른 분들께 도움이 될 솔직한 후기를 남겨주세요."
            maxLength={1000}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '14px',
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#0a0a0a'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e5e5'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '11px', color: '#bbb', fontWeight: '600' }}>{formContent.length} / 1000</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCancelForm}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #e5e5e5',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >취소</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formContent.trim()}
                style={{
                  padding: '10px 24px',
                  background: formContent.trim() ? '#0a0a0a' : '#bbb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: formContent.trim() && !submitting ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >{submitting ? '저장 중...' : (editingId ? '수정 완료' : '등록하기')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 후기 리스트 ── */}
      {reviews.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#bbb', fontSize: '14px' }}>
          아직 등록된 관람 후기가 없어요. 첫 후기를 남겨주세요!
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {reviews.map(r => {
            const isMine = currentUserId && r.userId === Number(currentUserId);
            return (
              <li
                key={r.id}
                style={{
                  padding: '20px 4px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <StarRating value={r.rating} readOnly size={14} />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0a0a0a' }}>{r.userName}</span>
                    {isMine && (
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '50px' }}>MY</span>
                    )}
                    <span style={{ fontSize: '12px', color: '#bbb', fontWeight: '600' }}>
                      {formatDate(r.createdAt)}
                      {r.updatedAt && <span style={{ marginLeft: '4px' }}>(수정됨)</span>}
                    </span>
                  </div>
                  {isMine && (
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleEdit(r)}
                        style={{
                          padding: '5px 12px',
                          background: 'transparent',
                          color: '#666',
                          border: '1px solid #e5e5e5',
                          borderRadius: '50px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >수정</button>
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
                        }}
                      >삭제</button>
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {r.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ReviewSection;
