// src/components/ChatBot.js
// DEAR TICKET 고객센터 플로팅 챗봇 UI
// 답변 키워드 감지 → 바로가기 버튼 자동 추가

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/index';

const QUICK_QUESTIONS = [
  '예매 취소는 어떻게 하나요?',
  '포인트 충전 방법이 궁금해요',
  '좌석 변경이 가능한가요?',
  '대기열이 뭔가요?',
];

// ── 키워드 → 바로가기 버튼 매핑 ──────────────────────────
const SHORTCUT_RULES = [
  {
    keywords: ['마이페이지', '예매확인', '예매 확인', '취소', '환불', '좌석변경', '좌석 변경'],
    buttons: [{ label: '📋 마이페이지 바로가기', path: '/mypage' }],
  },
  {
    keywords: ['로그인', '회원가입', '이메일', '비밀번호'],
    buttons: [{ label: '🔑 로그인 바로가기', path: '/login' }],
  },
  {
    keywords: ['검색', '공연 찾기', '공연을 찾', '카테고리'],
    buttons: [{ label: '🔍 공연 검색 바로가기', path: '/search' }],
  },
  {
    keywords: ['포인트', '충전'],
    buttons: [{ label: '💰 포인트 충전 바로가기', path: '/mypage' }],
  },
  {
    keywords: ['홈', '메인', '처음'],
    buttons: [{ label: '🏠 홈으로 바로가기', path: '/' }],
  },
];

// 답변 텍스트에서 매칭되는 버튼 목록 추출
const getShortcuts = (text) => {
  const buttons = [];
  const seen = new Set();
  for (const rule of SHORTCUT_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      for (const btn of rule.buttons) {
        if (!seen.has(btn.path)) {
          buttons.push(btn);
          seen.add(btn.path);
        }
      }
    }
  }
  return buttons;
};

function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: '안녕하세요! DEAR TICKET 고객센터입니다 😊\n무엇을 도와드릴까요?', shortcuts: [] },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setShowQuick(false);
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: userText, shortcuts: [] }]);
    setIsLoading(true);

    try {
      const response = await API.post('/api/chat', { message: userText });
      const reply = response.data?.reply || '죄송합니다. 다시 시도해 주세요.';
      const shortcuts = getShortcuts(reply);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply, shortcuts }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: '현재 고객센터 챗봇에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', shortcuts: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleReset = () => {
    setMessages([{ id: Date.now(), role: 'bot', text: '안녕하세요! DEAR TICKET 고객센터입니다 😊\n무엇을 도와드릴까요?', shortcuts: [] }]);
    setShowQuick(true);
  };

  const handleShortcut = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: isOpen ? '#1e40af' : 'linear-gradient(135deg, #2563eb, #60a5fa)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,99,235,0.40)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', zIndex: 2000,
          transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
          transform: isOpen ? 'rotate(180deg) scale(1.05)' : 'scale(1)',
        }}
        title="고객센터 챗봇"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '28px',
          width: '360px', height: '520px',
          backgroundColor: '#fff', borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.16)',
          border: '1px solid #ebebeb',
          display: 'flex', flexDirection: 'column',
          zIndex: 1999, overflow: 'hidden',
          fontFamily: "'Pretendard', sans-serif",
          animation: 'chatSlideUp 0.22s cubic-bezier(.4,0,.2,1)',
        }}>

          {/* 헤더 */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            padding: '16px 18px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>🎫</div>
              <div>
                <p style={{ color: '#fff', fontWeight: '800', fontSize: '14px', margin: 0 }}>고객센터</p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: 0, fontWeight: '500' }}>DEAR TICKET AI 상담</p>
              </div>
            </div>
            <button onClick={handleReset} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '11px', fontWeight: '700',
              padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit',
            }}>초기화</button>
          </div>

          {/* 메시지 영역 */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa',
          }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end', gap: '6px',
                }}>
                  {msg.role === 'bot' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#eff6ff', border: '1px solid #dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0,
                    }}>🎫</div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#0a0a0a',
                    fontSize: '13px', fontWeight: '500', lineHeight: '1.6',
                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(37,99,235,0.30)' : '0 2px 8px rgba(0,0,0,0.06)',
                    border: msg.role === 'bot' ? '1px solid #ebebeb' : 'none',
                    whiteSpace: 'pre-line', wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                </div>

                {/* 바로가기 버튼 */}
                {msg.role === 'bot' && msg.shortcuts && msg.shortcuts.length > 0 && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '6px',
                    marginTop: '8px', marginLeft: '34px',
                  }}>
                    {msg.shortcuts.map((btn) => (
                      <button
                        key={btn.path}
                        onClick={() => handleShortcut(btn.path)}
                        style={{
                          padding: '7px 12px',
                          border: '1px solid #2563eb',
                          borderRadius: '50px',
                          background: '#fff',
                          color: '#2563eb',
                          fontSize: '12px', fontWeight: '700',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                          boxShadow: '0 2px 8px rgba(37,99,235,0.12)',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#2563eb'; }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 로딩 버블 */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#eff6ff', border: '1px solid #dbeafe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0,
                }}>🎫</div>
                <div style={{
                  padding: '12px 16px', background: '#fff',
                  borderRadius: '4px 16px 16px 16px', border: '1px solid #ebebeb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#2563eb',
                      animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0.4,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* 빠른 질문 버튼 */}
            {showQuick && !isLoading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)} style={{
                    padding: '7px 12px', border: '1px solid #dbeafe',
                    borderRadius: '50px', background: '#eff6ff', color: '#2563eb',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                  >{q}</button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid #ebebeb',
            background: '#fff', display: 'flex', gap: '8px',
            alignItems: 'flex-end', flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 점을 입력하세요..."
              rows={1}
              disabled={isLoading}
              style={{
                flex: 1, border: '1.5px solid #ebebeb', borderRadius: '12px',
                padding: '10px 14px', fontSize: '13px', fontFamily: 'inherit',
                resize: 'none', outline: 'none', lineHeight: '1.5',
                maxHeight: '80px', overflowY: 'auto',
                transition: 'border-color 0.15s', background: '#fafafa', color: '#0a0a0a',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#ebebeb')}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: isLoading || !input.trim() ? '#e5e5e5' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none', color: '#fff', fontSize: '16px',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
                boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 12px rgba(37,99,235,0.30)',
              }}
            >↑</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}

export default ChatBot;