// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/authApi';
import logo from '../assets/logo.png';
import '../App.css';

function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await login(email, password); alert('반갑습니다! 로그인이 완료되었습니다.'); navigate('/'); }
    catch { alert('이메일 또는 비밀번호를 다시 확인해주세요.'); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try { await signup({ email, name, password }); alert('회원가입 완료! 로그인해주세요.'); setIsLoginView(true); }
    catch (error) { alert(error.response?.data || '회원가입 중 오류가 발생했습니다.'); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <img src={logo} alt="DEAR TICKET" onClick={() => navigate('/')}
        style={{ height: '40px', cursor: 'pointer', marginBottom: '36px', userSelect: 'none', objectFit: 'contain' }} />

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '20px', padding: '44px 40px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #ebebeb', marginBottom: '32px' }}>
          {['로그인', '회원가입'].map((label, i) => (
            <button key={label} onClick={() => setIsLoginView(i === 0)}
              style={{ flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '800', fontFamily: 'inherit', color: (isLoginView ? i === 0 : i === 1) ? '#0a0a0a' : '#bbb', borderBottom: (isLoginView ? i === 0 : i === 1) ? '2.5px solid #0a0a0a' : '2.5px solid transparent', marginBottom: '-1px', transition: 'all 0.18s' }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={isLoginView ? handleLogin : handleSignup}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '7px', letterSpacing: '0.3px' }}>이메일</label>
            <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} required
              className="vivid-input" style={{ borderRadius: '10px', height: '48px', fontSize: '14px', paddingRight: '16px' }} />
          </div>

          {!isLoginView && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '7px', letterSpacing: '0.3px' }}>이름</label>
              <input type="text" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} required
                className="vivid-input" style={{ borderRadius: '10px', height: '48px', fontSize: '14px', paddingRight: '16px' }} />
            </div>
          )}

          <div style={{ marginBottom: '26px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '7px', letterSpacing: '0.3px' }}>비밀번호</label>
            <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} required
              className="vivid-input" style={{ borderRadius: '10px', height: '48px', fontSize: '14px', paddingRight: '16px' }} />
          </div>

          <button type="submit" className="vivid-button" style={{ height: '50px', borderRadius: '12px', fontSize: '15px' }}>
            {isLoginView ? '로그인' : '회원가입'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#aaa' }}>
          {isLoginView ? '아직 회원이 아니신가요? ' : '이미 계정이 있으신가요? '}
          <span onClick={() => setIsLoginView(!isLoginView)} style={{ color: '#2563eb', fontWeight: '700', cursor: 'pointer' }}>
            {isLoginView ? '회원가입' : '로그인'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;