// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/authApi';
import logo from '../assets/logo.png';
import '../App.css';

// JWT의 role 추출
const decodeRole = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.role || null;
  } catch {
    return null;
  }
};

const TABS = [
  { id: 'login',    label: '로그인' },
  { id: 'signup',   label: '회원가입' },
  { id: 'admin',    label: '관리자' },
];

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const isAdminTab = activeTab === 'admin';

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    resetFields();
  };

  // ────────────────────────────────────────
  // 일반 사용자 로그인
  // ────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      const role = decodeRole(result.token);

      // 관리자가 일반 로그인 탭으로 잘못 들어왔을 때
      if (role === 'ROLE_ADMIN') {
        alert('관리자 계정입니다. 관리자 페이지로 이동합니다.');
        navigate('/admin');
        return;
      }
      alert('반갑습니다! 로그인이 완료되었습니다.');
      navigate('/');
    } catch {
      alert('이메일 또는 비밀번호를 다시 확인해주세요.');
    }
  };

  // ────────────────────────────────────────
  // 관리자 로그인
  // ────────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      const role = decodeRole(result.token);

      if (role !== 'ROLE_ADMIN') {
        // 관리자 계정이 아니면 로그아웃 처리 후 안내
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        alert('관리자 권한이 없는 계정입니다.\n일반 로그인 탭을 이용해주세요.');
        return;
      }
      alert('관리자로 로그인되었습니다.');
      navigate('/admin');
    } catch {
      alert('이메일 또는 비밀번호를 다시 확인해주세요.');
    }
  };

  // ────────────────────────────────────────
  // 회원가입
  // ────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup({ email, name, password });
      alert('회원가입 완료! 로그인해주세요.');
      setActiveTab('login');
      resetFields();
    } catch (error) {
      alert(error.response?.data || '회원가입 중 오류가 발생했습니다.');
    }
  };

  // 탭별 폼 제출 핸들러 매핑
  const handleSubmit =
    activeTab === 'admin'  ? handleAdminLogin :
    activeTab === 'signup' ? handleSignup :
    handleLogin;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isAdminTab ? '#0a0a0a' : '#fafafa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      transition: 'background-color 0.3s',
    }}>
      <img
        src={logo}
        alt="DEAR TICKET"
        onClick={() => navigate('/')}
        style={{
          height: '40px',
          cursor: 'pointer',
          marginBottom: '36px',
          userSelect: 'none',
          objectFit: 'contain',
          filter: isAdminTab ? 'invert(1) brightness(2)' : 'none',
          transition: 'filter 0.3s',
        }}
      />

      <div style={{
        width: '100%', maxWidth: '420px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '44px 40px',
        boxShadow: isAdminTab
          ? '0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        transition: 'box-shadow 0.3s',
      }}>
        {/* ── 탭 ── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #ebebeb',
          marginBottom: '28px',
        }}>
          {TABS.map(t => {
            const active = activeTab === t.id;
            const isAdminBtn = t.id === 'admin';
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '800',
                  fontFamily: 'inherit',
                  color: active
                    ? (isAdminBtn ? '#0a0a0a' : '#0a0a0a')
                    : '#bbb',
                  borderBottom: active
                    ? `2.5px solid ${isAdminBtn ? '#0a0a0a' : '#0a0a0a'}`
                    : '2.5px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {isAdminBtn && <span style={{ fontSize: '12px' }}>🔧</span>}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── 관리자 탭 안내 배너 ── */}
        {isAdminTab && (
          <div style={{
            padding: '12px 14px',
            background: '#fff8f0',
            border: '1px solid #ffe4c2',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#a66200',
            fontWeight: '700',
            lineHeight: 1.5,
          }}>
            ⚠️ 관리자 전용 로그인입니다. 일반 회원은 일반 로그인 탭을 이용해주세요.
          </div>
        )}

        {/* ── 폼 ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '7px', letterSpacing: '0.3px' }}>
              이메일
            </label>
            <input
              type="email"
              placeholder={isAdminTab ? 'admin@dearticket.com' : 'example@email.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="vivid-input"
              style={{ borderRadius: '10px', height: '48px', fontSize: '14px', paddingRight: '16px' }}
            />
          </div>

          {activeTab === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '7px', letterSpacing: '0.3px' }}>
                이름
              </label>
              <input
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="vivid-input"
                style={{ borderRadius: '10px', height: '48px', fontSize: '14px', paddingRight: '16px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '7px', letterSpacing: '0.3px' }}>
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="vivid-input"
              style={{ borderRadius: '10px', height: '48px', fontSize: '14px', paddingRight: '16px' }}
            />
          </div>

          <button
            type="submit"
            className="vivid-button"
            style={{
              height: '50px',
              borderRadius: '12px',
              fontSize: '15px',
              background: isAdminTab ? '#0a0a0a' : undefined,
            }}
          >
            {activeTab === 'admin'  ? '🔧 관리자 로그인'
              : activeTab === 'signup' ? '회원가입'
              : '로그인'}
          </button>
        </form>

        {/* ── 하단 안내 ── */}
        {activeTab !== 'admin' && (
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#aaa' }}>
            {activeTab === 'login' ? '아직 회원이 아니신가요? ' : '이미 계정이 있으신가요? '}
            <span
              onClick={() => handleTabChange(activeTab === 'login' ? 'signup' : 'login')}
              style={{ color: '#2563eb', fontWeight: '700', cursor: 'pointer' }}
            >
              {activeTab === 'login' ? '회원가입' : '로그인'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;