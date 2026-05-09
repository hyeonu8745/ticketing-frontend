// src/components/EventCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function EventCard({ event, rank }) {
  const navigate = useNavigate();

  const remainingRatio = event.totalSeats > 0
    ? event.remainingSeats / event.totalSeats
    : 1;
  const isSoldOut = event.remainingSeats === 0;
  const isAlmostSoldOut = !isSoldOut && remainingRatio < 0.15;

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      style={{ cursor: 'pointer', width: '100%' }}
      className="event-card"
    >
      {/* 포스터 이미지 — 3:4 비율 고정 */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '133%',          // ✅ aspect-ratio 대신 padding-top 트릭 (호환성↑)
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f0f0f0',
        marginBottom: '10px',
      }}>
        <img
          src={event.posterUrl || 'https://via.placeholder.com/180x240?text=NO+IMAGE'}
          alt={event.title}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            display: 'block',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* 랭킹 배지 */}
        {rank !== undefined && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            width: '26px', height: '26px',
            borderRadius: '6px',
            background: rank <= 3 ? '#0a0a0a' : 'rgba(255,35,81,0.92)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '900',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}>
            {rank}
          </div>
        )}

        {/* 상태 배지 */}
        {isSoldOut && (
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(0,0,0,0.7)', color: '#fff',
            fontSize: '10px', fontWeight: '800',
            padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.3px',
          }}>
            매진
          </div>
        )}
        {isAlmostSoldOut && (
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(255,35,81,0.92)', color: '#fff',
            fontSize: '10px', fontWeight: '800',
            padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.3px',
          }}>
            마감임박
          </div>
        )}
      </div>

      {/* 텍스트 정보 */}
      <p style={{
        fontSize: '13px', fontWeight: '700', color: '#0a0a0a',
        lineHeight: '1.35', marginBottom: '4px',
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        minHeight: '36px',
      }}>
        {event.title}
      </p>
      <p style={{ fontSize: '12px', color: '#888', fontWeight: '500', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.location}
      </p>
      {event.priceRange && (
        <p style={{ fontSize: '12px', color: '#ff2351', fontWeight: '700' }}>
          {event.priceRange}
        </p>
      )}
    </div>
  );
}

export default EventCard;