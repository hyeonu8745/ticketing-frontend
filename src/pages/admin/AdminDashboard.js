// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard, syncKopis } from '../../api/adminApi';

const fmt = (n) => Number(n).toLocaleString();

function StatCard({ label, value, sub, color = '#0a0a0a' }) {
  return (
    <div style={{
      background: '#fff', padding: '24px', borderRadius: '14px',
      border: '1px solid #ebebeb', flex: 1, minWidth: '180px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '1px', marginBottom: '10px' }}>
        {label}
      </p>
      <p style={{ fontSize: '28px', fontWeight: '900', color, lineHeight: 1.1, marginBottom: '4px' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color: '#bbb', fontWeight: '600' }}>{sub}</p>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(100);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboard();
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    if (!window.confirm(`KOPIS에서 ${syncCount}개의 공연 데이터를 가져옵니다. 진행할까요?`)) return;
    setSyncing(true);
    try {
      await syncKopis(syncCount);
      alert('동기화 요청을 보냈습니다. 백엔드 로그를 확인하세요.');
      await load();
    } catch (e) {
      alert('동기화 실패: ' + (e.response?.data || e.message));
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !data) {
    return <div style={{ padding: '40px', color: '#bbb' }}>불러오는 중...</div>;
  }

  const maxDaily = Math.max(...data.reservationsLast7Days.map(d => d.count), 1);
  const maxTop = Math.max(...data.topEvents.map(t => t.reservationCount), 1);
  const totalCategory = data.eventsByCategory.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '2px', marginBottom: '6px' }}>
            DASHBOARD
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0a0a0a', margin: 0 }}>
            서비스 현황 한눈에 보기
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            value={syncCount}
            onChange={(e) => setSyncCount(Number(e.target.value))}
            min={10}
            max={1000}
            style={{
              padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '8px',
              fontSize: '13px', width: '80px', fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '10px 18px', background: '#0a0a0a', color: '#fff',
              border: 'none', borderRadius: '50px', fontSize: '12px', fontWeight: '800',
              cursor: syncing ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              opacity: syncing ? 0.6 : 1,
            }}
          >{syncing ? '동기화 중...' : '🌐 KOPIS 동기화'}</button>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <StatCard label="총 회원" value={fmt(data.totalUsers)} sub={`명`} />
        <StatCard label="총 공연" value={fmt(data.totalEvents)} sub={`공개: ${data.visibleEvents}개`} />
        <StatCard label="활성 예매" value={fmt(data.activeReservations)} sub={`총 ${data.totalReservations}건`} />
        <StatCard label="누적 후기" value={fmt(data.totalReviews)} sub={`건`} />
        <StatCard label="누적 매출" value={fmt(data.totalRevenue) + '원'} color="#2563eb" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* ── 최근 7일 예매 추이 ── */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #ebebeb' }}>
          <p style={{ fontSize: '13px', fontWeight: '800', color: '#0a0a0a', marginBottom: '4px' }}>
            최근 7일 예매 추이
          </p>
          <p style={{ fontSize: '11px', color: '#bbb', fontWeight: '600', marginBottom: '20px' }}>
            CONFIRMED 기준
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '180px' }}>
            {data.reservationsLast7Days.map((d, idx) => {
              const h = (d.count / maxDaily) * 100;
              const dateLabel = d.date.substring(5).replace('-', '/');
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0a0a0a' }}>{d.count}</span>
                  <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(h, 2)}%`,
                        background: 'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.5s',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>{dateLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 카테고리별 공연 수 ── */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #ebebeb' }}>
          <p style={{ fontSize: '13px', fontWeight: '800', color: '#0a0a0a', marginBottom: '20px' }}>
            카테고리별 공연 분포
          </p>
          {data.eventsByCategory.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#bbb' }}>데이터 없음</p>
          ) : data.eventsByCategory.map((c, idx) => {
            const pct = ((c.count / totalCategory) * 100).toFixed(1);
            const colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
            return (
              <div key={c.category} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0a0a0a' }}>{c.category}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#888' }}>{c.count}개 ({pct}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: colors[idx % colors.length], borderRadius: '4px',
                    transition: 'width 0.5s',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 인기 공연 TOP 5 ── */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #ebebeb' }}>
        <p style={{ fontSize: '13px', fontWeight: '800', color: '#0a0a0a', marginBottom: '20px' }}>
          🔥 인기 공연 TOP 5 (CONFIRMED 예매 수 기준)
        </p>
        {data.topEvents.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#bbb' }}>예매 데이터가 없습니다.</p>
        ) : data.topEvents.map((t, idx) => {
          const pct = (t.reservationCount / maxTop) * 100;
          return (
            <div
              key={t.eventId}
              onClick={() => navigate(`/events/${t.eventId}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 0', borderBottom: idx < 4 ? '1px solid #f5f5f5' : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{
                fontSize: '14px', fontWeight: '900',
                color: idx < 3 ? '#2563eb' : '#bbb',
                width: '24px', flexShrink: 0,
              }}>#{idx + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </p>
                <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                  }} />
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0a0a0a', flexShrink: 0 }}>
                {fmt(t.reservationCount)}건
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;
