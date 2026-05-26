# DEAR TICKET — Frontend

![CI](https://github.com/hyeonu8745/ticketing-frontend/actions/workflows/ci.yml/badge.svg)

> 고가용성 실시간 티켓팅 서비스 프론트엔드
> React + Axios + 실시간 대기열 UI

---

## Tech Stack

| 분류 | 기술 |
|------|------|
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP | Axios |
| 스타일 | CSS (App.css) |
| 폰트 | Pretendard |
| CI/CD | GitHub Actions |

---

## 프로젝트 구조

```
src/
├── api/
│   ├── index.js          # Axios 인스턴스 (baseURL, JWT 인터셉터)
│   ├── authApi.js        # 로그인 / 회원가입
│   ├── eventApi.js       # 공연 조회 / 검색
│   ├── queueApi.js       # 대기열
│   ├── reviewApi.js      # 관람 후기
│   ├── adminApi.js       # 관리자 API
│   └── paymentApi.js     # 결제
│
├── components/
│   ├── EventCard.js      # 공연 카드
│   ├── ReviewSection.js  # 관람 후기 섹션
│   ├── MyReviewList.js   # 내 후기 목록
│   └── ChatBot.js        # 고객센터 플로팅 챗봇
│
├── pages/
│   ├── HomePage.js               # 메인 홈 (배너, 랭킹, 그리드)
│   ├── SearchPage.js             # 공연 검색
│   ├── EventDetailPage.js        # 공연 상세 (AI 수요예측, AI 추천)
│   ├── QueuePage.js              # 실시간 대기열
│   ├── SeatPage.js               # 좌석 선택
│   ├── SuccessPage.js            # 예매 완료
│   ├── ReservationDetailPage.js  # 예매 내역 상세
│   ├── MyPage.js                 # 마이페이지
│   ├── LoginPage.js              # 로그인 / 회원가입
│   └── admin/
│       ├── AdminLayout.js            # 관리자 레이아웃 (사이드바)
│       ├── AdminDashboard.js         # 대시보드
│       ├── AdminEventsPage.js        # 공연 관리
│       ├── AdminReservationsPage.js  # 예매 관리
│       ├── AdminUsersPage.js         # 회원 관리
│       └── AdminReviewsPage.js       # 후기 관리
│
├── App.js    # 라우팅
└── App.css   # 전역 스타일
```

---

## 주요 기능

### 메인 홈
- 동적 색상 추출 배너 슬라이더 (공연 포스터 주요색 기반 배경 자동 변경)
- 카테고리별 인기 공연 랭킹 (콘서트, 뮤지컬, 연극, 내한공연)
- 무한 스크롤 공연 그리드

### 검색
- 공연명 / 아티스트 / 장소 통합 검색

### 공연 상세
- AI 수요 예측: 향후 12시간 시간대별 혼잡도 + 매진 예상 일시
- AI 개인화 추천: 예매 내역 기반 유사 공연 슬라이더
- 관람 후기: 별점 작성, AI 요약

### 예매 플로우
```
공연 상세 → 대기열 입장 → 대기열 통과 → 좌석 선택 → 예매 완료
```
- 실시간 대기열 순번 폴링
- 인터랙티브 좌석 선택 UI (등급별 색상 구분, 잔여석 표시)
- 포인트 결제

### 마이페이지
- 예매 내역 조회 및 취소
- 내 후기 목록 조회 / 수정 / 삭제
- 포인트 충전

### 관리자 콘솔 (`/admin`)
- 관리자 계정 로그인 시 홈 네비게이션 바에 관리자 콘솔 버튼 노출
- JWT 디코딩(클라이언트) + `/api/users/me`(서버) 이중 권한 검증
- 공연 관리 (KOPIS 동기화, 수정)
- 예매 / 회원 / 후기 관리

### 챗봇
- 모든 페이지 우하단 플로팅 UI (Ollama Qwen3 8B 기반)
- 키워드 기반 바로가기 (마이페이지, 검색, 포인트 충전 등)

---

## 실행 방법

### 1. 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
PORT=3001
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=www.jihyeonu.com
WDS_SOCKET_PORT=443
WDS_SOCKET_PATH=/ws
REACT_APP_API_URL=https://api.jihyeonu.com
```

### 2. 패키지 설치 및 개발 서버 실행

```bash
npm install
npm start
```

기본 포트: `http://localhost:3001`

### 3. 프로덕션 빌드 및 배포

```bash
# 빌드
npm run build

# build/ 폴더를 Nginx 서빙 경로에 복사 (WSL)
cp -r build/* /var/www/ticketing/

# Nginx 재시작
sudo systemctl reload nginx
```

> 배포 후에는 `npm start` 없이 Nginx가 정적 파일을 직접 서빙합니다.
> Cloudflare Tunnel에서 `jihyeonu.com → http://localhost:80` 으로 설정해야 합니다.

---

## 테스트 계정

| 구분 | 이메일 | 비밀번호 |
|------|--------|---------|
| 관리자 | admin@dearticket.com | dearticket!admin1234 |
| 일반 회원 | 회원가입 후 이용 | - |

---

## 백엔드 연동

모든 API 요청은 `src/api/index.js`의 Axios 인스턴스를 통해 처리됩니다.

- `baseURL`: `.env`의 `REACT_APP_API_URL`
- JWT 토큰은 `localStorage`에 저장 후 요청 헤더에 자동 주입
- 401 응답 시 자동 로그아웃 처리

---

## 관련 레포지토리

- 백엔드: [DEAR TICKET Backend](https://github.com/hyeonu8745/ticketing-server)
- AI 서버: [DEAR TICKET AI](https://github.com/hyeonu8745/ticketing-ai)