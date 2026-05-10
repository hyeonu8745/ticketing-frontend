// src/pages/MyPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { getMyReservations, cancelReservation } from '../api/paymentApi';
import { getUserProfile, updateProfile, chargePoints } from '../api/authApi';
import '../App.css';

const TABS = [
  { id: 'reservations', label: '예매확인/취소' },
  { id: 'points', label: '포인트 충전' },
  { id: 'profile', label: '회원정보 수정' },
];

function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState({ name: '', email: '', point: 0 });
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const [resData, userData] = await Promise.all([getMyReservations(), getUserProfile()]);
      setReservations(Array.isArray(resData) ? resData : []);
      setUser(userData);
      setEditName(userData.name);
      setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => { fetchMyData(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('정말 예매를 취소하시겠습니까?')) return;
    try { await cancelReservation(id); alert('취소가 완료되었습니다.'); fetchMyData(); }
    catch (err) { alert('취소 실패: ' + err.message); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try { await updateProfile({ name: editName }); alert('회원 정보가 수정되었습니다.'); fetchMyData(); }
    catch (err) { alert('수정 실패: ' + err.message); }
  };

  const handleChargePoint = async (e) => {
    e.preventDefault();
    const amount = Number(chargeAmount);
    if (!amount || amount <= 0) return alert('올바른 금액을 입력해주세요.');
    try { await chargePoints(amount); alert(`${amount.toLocaleString()}P 충전 완료!`); setChargeAmount(''); fetchMyData(); }
    catch (err) { alert('충전 실패: ' + err.message); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <nav className="navbar" style={{ backgroundColor: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src={logo} alt="DEAR TICKET" onClick={() => navigate('/')} style={{ height: '36px', cursor: 'pointer', userSelect: 'none', objectFit: 'contain' }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#888' }}>나의 티켓 센터</span>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '40px', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          <aside style={{ width: '210px', flexShrink: 0 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px 20px', marginBottom: '12px', border: '1px solid #ebebeb', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px' }}>🎟️</div>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#0a0a0a', marginBottom: '4px' }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>{user.email}</p>
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px', fontSize: '13px' }}>
                <span style={{ color: '#aaa', fontSize: '11px', fontWeight: '600' }}>보유 포인트</span><br />
                <span style={{ color: '#2563eb', fontWeight: '900', fontSize: '20px' }}>{user.point?.toLocaleString()}</span>
                <span style={{ color: '#2563eb', fontSize: '12px', fontWeight: '700' }}> P</span>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ebebeb' }}>
              {TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'block', width: '100%', padding: '15px 20px',
                    border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer',
                    fontSize: '14px', fontWeight: activeTab === tab.id ? '800' : '500',
                    color: activeTab === tab.id ? '#2563eb' : '#666',
                    borderLeft: `3px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`,
                    borderBottom: i < TABS.length - 1 ? '1px solid #f5f5f5' : 'none',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <main style={{ flex: 1 }}>

            {activeTab === 'reservations' && (
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a' }}>예매 내역</h3>
                  <span style={{ fontSize: '13px', color: '#aaa', fontWeight: '600' }}>총 {reservations.length}건</span>
                </div>
                {reservations.length === 0 ? (
                  <div style={{ padding: '80px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #ebebeb' }}>
                    <p style={{ fontSize: '36px', marginBottom: '12px' }}>🎫</p>
                    <p style={{ color: '#bbb', fontSize: '15px', fontWeight: '600' }}>예매 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {reservations.map(res => (
                      <div
                        key={res.reservationId}
                        onClick={() => navigate(`/mypage/reservation/${res.reservationId}`)}
                        style={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: '14px', padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.18s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.10)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#ebebeb'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: '44px', height: '44px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🎫</div>
                          <div>
                            <h4 style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: '800', color: '#0a0a0a' }}>{res.eventTitle}</h4>
                            <p style={{ fontSize: '12px', color: '#aaa', fontWeight: '500' }}>
                              {res.seatNumber} <span style={{ margin: '0 6px', color: '#e0e0e0' }}>|</span> {new Date(res.reservedAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); navigate(`/events/${res.eventId}/seats`, { state: { isChangeMode: true, oldReservationId: res.reservationId } }); }}
                            style={{ padding: '8px 14px', border: '1px solid #ebebeb', borderRadius: '50px', background: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#555', fontFamily: 'inherit' }}>
                            좌석변경
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleCancel(res.reservationId); }}
                            style={{ padding: '8px 14px', border: '1px solid #2563eb', borderRadius: '50px', background: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#2563eb', fontFamily: 'inherit' }}>
                            취소
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'points' && (
              <section>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a', marginBottom: '20px' }}>포인트 관리</h3>
                <div style={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: '20px', padding: '52px 40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>현재 보유 포인트</p>
                  <div style={{ fontSize: '56px', fontWeight: '900', color: '#0a0a0a', letterSpacing: '-2px', lineHeight: 1, marginBottom: '6px' }}>
                    {user.point?.toLocaleString()}
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb', marginBottom: '44px' }}>P</p>
                  <form onSubmit={handleChargePoint} style={{ display: 'flex', gap: '10px', maxWidth: '340px', margin: '0 auto' }}>
                    <input type="number" placeholder="충전할 금액" value={chargeAmount} onChange={e => setChargeAmount(e.target.value)}
                      className="vivid-input" style={{ height: '48px', borderRadius: '12px', paddingRight: '16px', fontSize: '15px' }} />
                    <button type="submit" className="vivid-button" style={{ width: 'auto', padding: '0 22px', height: '48px', borderRadius: '12px', fontSize: '14px', flexShrink: 0 }}>충전</button>
                  </form>
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a', marginBottom: '20px' }}>회원정보 수정</h3>
                <div style={{ backgroundColor: '#fff', border: '1px solid #ebebeb', borderRadius: '20px', padding: '36px 32px', maxWidth: '440px' }}>
                  <form onSubmit={handleUpdateUser}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#aaa', letterSpacing: '0.3px', marginBottom: '8px' }}>이메일</label>
                      <input value={user.email} disabled style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #f0f0f0', borderRadius: '10px', background: '#fafafa', color: '#bbb', fontSize: '14px', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#aaa', letterSpacing: '0.3px', marginBottom: '8px' }}>이름</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="vivid-input" style={{ height: '48px', borderRadius: '10px', paddingRight: '16px', fontSize: '14px' }} />
                    </div>
                    <button type="submit" className="vivid-button" style={{ height: '50px', borderRadius: '12px', fontSize: '15px' }}>정보 저장</button>
                  </form>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default MyPage;