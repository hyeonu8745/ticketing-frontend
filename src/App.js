// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EventDetailPage from './pages/EventDetailPage';
import QueuePage from './pages/QueuePage';
import SeatPage from './pages/SeatPage';
import SuccessPage from './pages/SuccessPage';
import MyPage from './pages/MyPage';
import SearchPage from './pages/SearchPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import ChatBot from './components/ChatBot'; // 🌟 추가
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchPage />} />
        
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        
        <Route path="/booking/:eventId" element={<QueuePage />} />
        <Route path="/events/:eventId/seats" element={<SeatPage />} />
        <Route path="/events/:eventId/success" element={<SuccessPage />} />
        
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/reservation/:reservationId" element={<ReservationDetailPage />} />
      </Routes>

      {/* 🌟 모든 페이지에서 챗봇 플로팅 버튼 표시 */}
      <ChatBot />
    </Router>
  );
}

export default App;