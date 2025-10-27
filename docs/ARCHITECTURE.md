# DevNest Architecture Overview

이 문서는 프론트엔드와 백엔드의 핵심 파일 및 설계 의도를 요약해, 유지 보수나 신규 기여 시 빠르게 전체 구조를 이해할 수 있도록 돕습니다.

---

## 1. Frontend (dev-nest-frontend)

- **기술 스택**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **상태 관리**: React Context (`AuthContext`, `NotificationContext`)
- **데이터 패칭**: `fetch` 기반 API 모듈 (`src/services/*`)

### 1.1 엔트리 & 전역 컨텍스트
- `src/main.tsx`
  - React 애플리케이션 진입점. `AuthProvider`, `NotificationProvider`, `RouterProvider`를 중첩해 전역 상태 및 라우터를 구성합니다.
- `src/App.tsx`
  - 공통 레이아웃(`Header` + `Outlet`)을 제공. 모든 페이지는 이 레이아웃 하위에 렌더링됩니다.

### 1.2 Contexts
- `src/contexts/AuthContext.tsx`
  - 로그인/로그아웃, 토큰 갱신, `localStorage` 저장/복원 기능을 제공.
  - `AuthUser`, `AuthToken` 타입을 정의하고 `useAuth` 훅으로 소비합니다.
- `src/contexts/NotificationContext.tsx`
  - 알림 목록을 `localStorage`에 영구 저장, 읽음 처리/알림 추가 기능 제공.
  - 헤더 알림 벨 및 댓글/포스트 작업과 연동됩니다.

### 1.3 Hooks
- `src/hooks/usePostDraft.ts`
  - 새 글 초안을 `localStorage`에 자동 저장·복원하는 훅. 자동 저장 간격 제어 및 삭제 기능 포함.
- `src/hooks/useMyPosts.ts`, `src/hooks/useMyComments.ts`
  - 마이페이지에서 본인 글/댓글 목록을 호출하고 로딩/에러 상태를 관리.

### 1.4 공통 유틸
- `src/utils/markdown.ts`
  - 마크다운 문자열을 HTML로 변환. 기본 강조/코드 블록 등을 지원.
- `src/utils/date.ts`
  - ISO 문자열을 날짜/일시로 포맷팅하는 함수 제공.

### 1.5 Layout & Components
- `src/components/Header.tsx`
  - 상단 네비게이션. 로그인 상태에 따라 버튼 노출, `NotificationBell` 포함.
- `src/components/NotificationBell.tsx`
  - 알림 아이콘/드롭다운 구현. 알림 목록 표시 및 읽음 처리.
- `src/components/comments/CommentsSection.tsx`
  - 댓글 트리 뷰, 작성/수정/삭제/좋아요 처리.
  - 작성/삭제 시 알림 컨텍스트로 메시지를 추가합니다.
- `src/components/mypage/*`
  - 마이페이지 요약 카드(`ProfileSummaryCard`), 글/댓글 리스트 섹션을 분리해 재사용 가능하도록 설계했습니다.

### 1.6 Pages (라우트 별 주요 파일)
- `src/pages/HomePage.tsx`
  - 인기 포스트 목록 + 태그 검색. 추천 태그 버튼을 통해 빠르게 검색어를 입력할 수 있습니다.
- `src/pages/SignInPage.tsx`, `src/pages/SignUpPage.tsx`
  - 인증 폼. `AuthForm` 컴포넌트 재사용.
- `src/pages/PostEditorPage.tsx`
  - 마크다운 에디터, 실시간 미리보기, 임시 저장 포함.
  - 작성/수정 후 알림 생성 및 초안 초기화.
- `src/pages/PostDetailPage.tsx`
  - 포스트 상세 뷰. 조회수 증가, 좋아요/취소, 댓글 섹션을 포함합니다.
- `src/pages/MyPage.tsx`
  - 사용자 활동 요약, 작성한 글/댓글 리스트.

### 1.7 Services
- `src/services/postsApi.ts`
  - 포스트 CRUD, 좋아요, `GET /api/posts/me` 등의 인증 엔드포인트 호출을 담당.
- `src/services/commentsApi.ts`
  - 댓글 CRUD, 좋아요, `GET /api/comments/me` 제공.
- `src/services/authApi.ts`
  - 로그인/회원가입/로그아웃 API.

### 1.8 라우터
- `src/routes/AppRoutes.tsx`
  - `createBrowserRouter`로 모든 페이지 라우트 정의.

---

## 2. Backend (dev-nest-backend)

- **기술 스택**: Spring Boot 3.5, Spring Security, JWT, MapStruct, MSSQL
- **패키지 규칙**: `com.developersnest.devnestbackend.<domain>` 구조, 각 도메인별 `entity/dto/repository/mapper/service/controller` 레이어 구분.

### 2.1 엔트리 & 설정
- `DevNestBackendApplication.java`
  - Spring Boot 엔트리. `@EnableConfigurationProperties(AuthProperties.class)`로 JWT 설정을 주입합니다.
- `auth/config/SecurityConfig.java`
  - JWT 필터, 인증/인가 규칙 정의.
  - GET `/api/posts/**`와 게시글/댓글 목록은 공개, 쓰기/내 정보 API는 인증 필요.

### 2.2 인증 도메인 (`auth`)
- `AuthController`
  - `/api/auth` 경로의 로그인/회원가입/로그아웃 엔드포인트.
- `AuthService`
  - 사용자 등록, 로그인(비밀번호 검증 + 토큰 발급), 로그아웃 처리.
- `AuthMapper`
  - MapStruct 기반 DTO ↔ Entity 매핑.
- `JwtTokenProvider`, `JwtAuthenticationFilter`
  - JWT 생성/검증 및 Spring Security 컨텍스트 설정.
- `UserRepository`, `UserEntity`
  - 사용자 정보 저장. `@PrePersist`/`@PreUpdate`로 타임스탬프 관리.

### 2.3 포스트 도메인 (`posts`)
- `PostController`
  - `/api/posts` CRUD, 슬러그 기반 조회, 좋아요, 내가 작성한 글 목록(`/me`) 제공.
- `PostService`
  - 슬러그 생성, 태그 매핑, 좋아요/조회수 증가 로직, 참여도 계산 등을 담당.
- `PostRepository`
  - 슬러그 조회, 검색(`search`), 작성자별 정렬(`findByAuthor_IdOrderByUpdatedAtDesc`).
- `PostMetricsEntity`
  - 조회수/좋아요 카운트를 분리 저장, `incrementViews/likes` 메서드 포함.
- `TagEntity`
  - 다대다 연관 관계 및 기본 메타정보.

### 2.4 댓글 도메인 (`comments`)
- `CommentController`
  - `/api/posts/{id}/comments`, `/api/comments` 경로를 다루며 CRUD/좋아요 제공.
- `CommentService`
  - 대댓글 트리 구성, 좋아요 집계, 내가 작성한 댓글(`/comments/me`) 반환.
- `CommentRepository`
  - 포스트별 댓글을 fetch join으로 불러와 작성자/부모/자식 정보를 한 번에 조회.
- `CommentReactionRepository`
  - 댓글 좋아요 개수, 사용자별 좋아요 여부, 댓글 ID 집합 기반 집계 쿼리 제공.

### 2.5 DTO & 매핑
- DTO 레이어(`posts/dto`, `comments/dto`, `auth/dto`)는 프론트엔드에서 기대하는 응답 스키마를 그대로 반영합니다.
- MapStruct 매퍼(`PostMapper`, `AuthMapper`)로 Entity ↔ DTO 변환을 자동화했습니다.

### 2.6 설정 파일
- `src/main/resources/application.properties`
  - 기본 DB, JWT 설정, Hibernate `ddl-auto=validate` 등 정의.
- 테스트 설정은 `src/test/resources/application-test.properties`에서 H2 메모리 DB를 사용하도록 구성해 두었습니다.

---

## 3. 데이터 흐름 요약

1. **인증**: 사용자가 로그인하면 `AuthContext`가 토큰을 저장하고, 모든 API 호출 시 `Authorization` 헤더로 전달합니다.
2. **포스트 조회**: `/api/posts/slug/{slug}` 호출로 상세 정보를 가져오면서 조회수를 증가시킵니다.
3. **좋아요/참여도**: `/api/posts/{postId}/engagement`로 좋아요·조회수 상태를 가져오고, 토글 시 POST/DELETE 요청을 보냅니다.
4. **댓글 작업**: `/api/posts/{postId}/comments`로 댓글 트리를 가져오고, 작성/수정/삭제/좋아요는 `/api/comments/**`로 처리합니다.
5. **마이페이지**: `/api/posts/me`, `/api/comments/me`로 본인 활동을 불러와 Frontend 컴포넌트에 반영합니다.
6. **알림**: 프론트에서 이벤트 발생 시 `NotificationContext`에 추가하여 헤더 알림 벨에서 확인할 수 있습니다 (현재는 로컬 저장소 기반).

---

## 4. 향후 확장 시 고려 사항

- 알림 기능을 서버와 연동하려면 `/api/notifications` 엔드포인트와 WebSocket/SSE 등을 도입하고, 프론트의 NotificationContext 저장 방식을 API 호출로 전환하면 됩니다.
- 태그 추천이나 검색 고도화를 위해 백엔드에 태그/검색 인덱스를 추가하고, 현재 프론트에서 임시로 집계하는 로직을 서버 결과로 교체할 수 있습니다.
- 조회수/좋아요 추세를 시각화하려면 `post_metrics`에 히스토리 테이블을 추가하고, 프론트에서 그래프 라이브러리를 사용하면 됩니다.



