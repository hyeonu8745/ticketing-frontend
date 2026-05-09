import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './api/index'; // 🌟 이 줄을 추가하세요! (API 설정을 앱 전체에 적용)
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();