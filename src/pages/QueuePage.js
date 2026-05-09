// src/pages/QueuePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQueueStatus } from '../api/queueApi';
import '../App.css';

function QueuePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [queueInfo, setQueueInfo] = useState({ position: null, status: 'WAITING' });
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    if (!localStorage.getItem('token')) { alert('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }

    const fetchQueueData = async () => {
      try {
        const data = await getQueueStatus(eventId);
        if (data) {
          setQueueInfo({ position: data.position, status: data.status });
          setProgress(data.position === 0 ? 100 : Math.min(95, Math.max(5, 100 - (data.position / 10))));
          if (data.status === 'ACTIVE' || data.position === 0) navigate(`/events/${eventId}/seats`);
        }
      } catch (error) {
        if (error.response?.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
      }
    };

    fetchQueueData();
    const timer = setInterval(fetchQueueData, 1000);
    return () => clearInterval(timer);
  }, [eventId, navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      {/* 로고 */}
      <div onClick={() => navigate('/')} style={{ fontSize: '22px', fontWeight: '900', color: '#ff2351', letterSpacing: '-2px', cursor: 'pointer', marginBottom: '40px', userSelect: 'none' }}>
        VIVID HW
      </div>

      <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#fff', padding: '52px 44px', borderRadius: '24px', border: '1px solid #ebebeb', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', textAlign: 'center' }}>

        {/* 아이콘 */}
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fff0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>
          ⏳
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0a0a0a', letterSpacing: '-0.5px', marginBottom: '8px' }}>대기 중입니다</h1>
        <p style={{ fontSize: '14px', color: '#aaa', fontWeight: '500', marginBottom: '36px', lineHeight: '1.6' }}>
          접속자가 많아 대기 순서에 따라 자동으로 연결됩니다.
        </p>

        {/* 진행 바 */}
        <div style={{ width: '100%', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '36px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, #ff2351, #ff7096)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
        </div>

        {/* 대기 순번 */}
        <div style={{ background: '#fff0f3', border: '1px solid #ffe0e7', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', color: '#ff2351', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>현재 대기 순번</p>
          <div style={{ fontSize: '56px', fontWeight: '900', color: '#ff2351', letterSpacing: '-2px', lineHeight: 1 }}>
            {queueInfo.position !== null ? queueInfo.position.toLocaleString() : '—'}
          </div>
          <p style={{ fontSize: '14px', color: '#ff9ab5', fontWeight: '600', marginTop: '8px' }}>명 대기 중</p>
        </div>

        {/* 안내 */}
        <div style={{ textAlign: 'left', fontSize: '12px', color: '#bbb', lineHeight: '1.8', background: '#fafafa', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ fontWeight: '700', color: '#ddd', marginBottom: '6px' }}>⚠ 주의사항</p>
          <p>• 새로고침 또는 창 닫기 시 대기 순서가 초기화될 수 있습니다.</p>
          <p>• 잠시만 기다려 주시면 자동으로 연결됩니다.</p>
        </div>
      </div>

      <p style={{ marginTop: '32px', fontSize: '12px', color: '#ccc', fontWeight: '500' }}>© 2026 VIVID HW</p>
    </div>
  );
}

export default QueuePage;