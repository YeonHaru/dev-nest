# dev-nest

> 개발자가 기술과 경험을 공유하는 블로그 플랫폼. 프론트엔드는 React/Vite, 백엔드는 Spring Boot 3 기반으로 구성되어 있습니다.

## 1. 빠른 시작

### 공통 요구 사항
- Node.js ≥ 18
- Java 21
- MSSQL Server (로컬 또는 원격)

### 프론트엔드
```bash
cd dev-nest-frontend
npm install
npm run dev
```
- 개발 서버: <http://localhost:5173>
- 빌드: `npm run build`
- 린트: `npm run lint`

### 백엔드
```bash
cd dev-nest-backend
./gradlew bootRun
```
- 기본 DB 정보: `jdbc:sqlserver://localhost:1433;databaseName=DEV_NEST`
- 환경 설정은 `src/main/resources/application.properties` 또는 프로필별 설정 파일에서 오버라이드하세요.

## 2. 주요 기능

### 인증 및 계정
- 회원가입, 로그인, 로그아웃
- JWT 기반 세션 유지 / 자동 토큰 갱신 준비

### 포스트 작성/관리
- 마크다운 작성 및 실시간 미리보기
- 로컬 임시 저장(자동 저장) 및 초안 복구
- 포스트 수정, 삭제, 좋아요/조회수 집계

### 댓글
- 대댓글 형태의 트리 구조
- 좋아요 토글, 삭제, 작성/수정
- 작성/삭제 시 알림과 연동

### 마이페이지
- 작성한 글/댓글 목록, 조회·좋아요 합계
- 알림 내역, 최근 활동 요약

### 알림
- 로컬 스토리지에 저장되는 알림 피드
- 헤더 알림 벨에서 읽음 처리 & 바로가기 제공

## 3. 폴더 구조 개요

```
dev-nest
├── dev-nest-frontend/        # React + Vite 앱
│   ├── src/
│   │   ├── components/       # ViewContainer, Header, 댓글/마이페이지 컴포넌트 등
│   │   ├── contexts/         # AuthContext, NotificationContext
│   │   ├── hooks/            # usePostDraft, useMyPosts, useMyComments 등
│   │   ├── pages/            # 페이지 단위 라우트
│   │   ├── services/         # postsApi, commentsApi, authApi
│   │   └── utils/            # 마크다운/날짜 렌더링 등 공통 유틸
│   └── package.json
└── dev-nest-backend/         # Spring Boot 프로젝트
    ├── src/main/java/com/developersnest/devnestbackend
    │   ├── auth/             # JWT, 사용자 관리
    │   ├── posts/            # 포스트 도메인 (controller/service/repository 등)
    │   └── comments/         # 댓글 도메인
    └── build.gradle
```

## 4. 프론트엔드 사용법

| 페이지 | 경로 | 설명 |
| --- | --- | --- |
| 홈 | `/` | 인기 포스트, 태그 검색, 최근 활동 |
| 로그인 | `/signin` | 계정 로그인 |
| 회원가입 | `/signup` | 새 계정 생성 |
| 새 글 작성 | `/posts/new` | 마크다운 에디터 + 실시간 미리보기 + 자동 초안 저장 |
| 글 상세 | `/posts/:slug` | 조회수/좋아요, 댓글 트리 표시 |
| 글 수정 | `/posts/:slug/edit` | 본인 글만 수정 가능 |
| 마이페이지 | `/mypage` | 본인 글/댓글 통계, 알림, 빠른 이동 |

### 알림 UI
- 헤더 오른쪽 종 아이콘을 눌러 최근 알림 확인
- “모두 읽음 처리” 버튼 지원
- 글/댓글 작성 및 삭제 시 알림 자동 생성

### 댓글 섹션 기능
- 비로그인 상태에서 작성 시 로그인 페이지로 이동 안내
- 마크다운 렌더링 및 좋아요/삭제/대댓글 지원
- 작성/삭제 후 리스트 자동 갱신

### 임시 저장
- 새 글 작성 중 800ms 간격으로 내용 자동 저장
- 새 페이지 방문 시 초안 자동 로드, “임시 저장 삭제하기” 버튼 제공

## 5. 백엔드 사용법 (요약)

| 엔드포인트 | 메서드 | 설명 |
| --- | --- | --- |
| `/api/auth/signup` | POST | 회원가입 |
| `/api/auth/login` | POST | 로그인 (JWT 발급) |
| `/api/posts` | GET/POST/PUT/DELETE | 포스트 목록/생성/수정/삭제 |
| `/api/posts/slug/{slug}` | GET | 슬러그 기반 상세 조회 (조회수 증가) |
| `/api/posts/{id}/engagement` | GET | 좋아요/조회수 상태 |
| `/api/posts/me` | GET | 내가 작성한 글 목록 |
| `/api/comments` 관련 | GET/POST/PUT/DELETE | 댓글 CRUD, 좋아요 |
| `/api/comments/me` | GET | 내가 작성한 댓글 목록 |

> 보안: `/api/posts/**`의 POST/PUT/DELETE와 `/api/comments/**`의 쓰기 요청은 JWT 인증이 필요하며, `/api/posts/me`와 `/api/comments/me`는 로그인 사용자만 접근 가능합니다.

## 6. 개발 팁

- 프론트엔드
  - `localStorage` 기반 기능(`NotificationContext`, `usePostDraft`)은 브라우저 프라이빗 모드에서는 초기화될 수 있습니다.
  - Tailwind v4를 사용하므로 `@apply` 기반 스타일링에 익숙해지는 것이 좋습니다.
- 백엔드
  - JDK 21과 Lombok, MapStruct 플러그인을 IDE에 설치해야 합니다.
  - `application.properties`에 정의된 기본 DB 정보는 로컬 개발용이므로 운영 환경에서는 프로필별 분리를 추천합니다.

## 7. 향후 확장 아이디어

- 알림 WebSocket 연동, 실제 DB 저장
- 조회수/좋아요 추세 그래프 추가
- 태그 기반 추천 포스트, 검색 고도화

---

