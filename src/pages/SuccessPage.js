// src/pages/SuccessPage.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { seatNumber, price, isChangeMode } = location.state || { seatNumber: '정보 없음', price: 0, isChangeMode: false };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '56px 44px', borderRadius: '24px', border: '1px solid #ebebeb', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '460px', width: '100%', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #2563eb, #60a5fa)' }} />

        <img src={logo} alt="DEAR TICKET" onClick={() => navigate('/')} style={{ height: '36px', cursor: 'pointer', userSelect: 'none', objectFit: 'contain', marginBottom: '32px' }} />

        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>
          {isChangeMode ? '🔄' : '✅'}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0a0a0a', letterSpacing: '-1px', marginBottom: '10px' }}>
          {isChangeMode ? '좌석 변경 완료!' : '예매가 완료되었습니다!'}
        </h1>
        <p style={{ fontSize: '14px', color: '#aaa', fontWeight: '500', lineHeight: '1.7', marginBottom: '36px' }}>
          {isChangeMode ? '새로운 좌석으로 변경되었습니다.' : 'DEAR TICKET을 이용해 주셔서 감사합니다.'}
        </p>

        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '28px', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px dashed #ebebeb', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#aaa' }}>선택 좌석</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#0a0a0a' }}>{seatNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#aaa' }}>{isChangeMode ? '정산 금액' : '결제 금액'}</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', letterSpacing: '-0.5px' }}>
              {price ? price.toLocaleString() : '0'}원
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={{ flex: 1, padding: '16px 0', fontSize: '14px', fontWeight: '700', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            홈으로
          </button>
          <button onClick={() => navigate('/mypage')} className="vivid-button" style={{ flex: 1.5, height: '52px', borderRadius: '12px', fontSize: '14px' }}>
            {isChangeMode ? '변경 내역 확인' : '예매 내역 확인'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;