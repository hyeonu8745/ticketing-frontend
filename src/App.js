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
import ReservationDetailPage from './pages/ReservationDetailPage'; // 🌟 추가
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
        {/* 🌟 예약 상세 페이지 경로 추가 */}
        <Route path="/mypage/reservation/:reservationId" element={<ReservationDetailPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;