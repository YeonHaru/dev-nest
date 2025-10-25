# Repository Guidelines

## 프론트엔드 가이드
- **구조**: `dev-nest-frontend/src/pages`에 라우트 페이지, `src/components`에 재사용 컴포넌트, `src/routes`에 라우터 로직, `src/assets`와 `public`에 정적 리소스를 둡니다. 레이아웃/컨텍스트는 `src/components`와 `src/contexts`로 분리하세요.
- **개발 명령**: 최초 실행은 `npm install`, 개발 서버는 `npm run dev`, 빌드는 `npm run build`, 정적 분석은 `npm run lint`입니다. Vitest 환경 도입 전에는 주요 페이지(`/`, `/signin`, `/posts/new`)를 수동으로 검증하세요.
- **환경 변수**: 백엔드 API 주소는 `VITE_API_BASE_URL`로 주입하며 기본값은 `http://localhost:8080`입니다. 배포 환경에서는 `.env` 또는 배포 설정에 맞춰 값을 지정하세요.
- **데이터 연동**: `src/services/postsApi.ts`에서 게시글 CRUD를 호출합니다. 컴포넌트에서는 이 API를 통해 목록(`GET /api/posts`), 상세(`/api/posts/slug/:slug`), 작성/수정/삭제를 처리합니다.
- **스타일**: 2칸 들여쓰기, 함수형 컴포넌트, PascalCase 파일명(예: `PostList.tsx`). Tailwind 유틸리티는 논리 그룹으로 묶고, 사용자 정의 스타일은 `index.css` 또는 컴포넌트 단위 CSS 모듈에 한정합니다. ESLint(`@typescript-eslint`, React Hooks 규칙) 경고는 커밋 전에 해결합니다.
- **상태 관리**: 전역 상태는 React Context(`src/contexts`)로 캡슐화하고 API 호출은 훅(`useQuery`, 사용자 정의 훅)으로 추상화합니다. 인증과 같은 사이드이펙트는 컨텍스트 또는 전용 서비스 모듈에 유지하세요.

## 백엔드 가이드
- **패키징**: `com.developersnest.devnestbackend.<domain>` 구조를 따르며, 각 도메인은 `entity`, `dto`, `repository`, `mapper`, `service`, `controller` 서브패키지로 분리합니다. 연결 도메인은 공유 패키지를 만들지 말고 명시적인 의존성으로 연결합니다.
- **기술 스택**: Spring Boot 3.5, Spring Security, JWT, MapStruct, Lombok, MSSQL을 사용합니다. `build.gradle`에 MapStruct, jjwt, spring-boot-starter-security 의존성을 추가하고, Java 21을 유지하세요.
- **구성**: CORS 허용 도메인은 `devnest.cors.allowed-origins`에 콤마로 선언합니다. JWT 비밀값(`devnest.jwt.secret`)은 환경변수나 별도 설정 파일에서 관리하세요. 기본 연결은 로컬 MSSQL(`jdbc:sqlserver://localhost:1433`, `sa`/`1234567890`)로 설정되어 있으니 배포 전에 환경에 맞춰 덮어쓰세요. 게시글 도메인은 `posts` 패키지에 `entity/dto/repository/mapper/service/controller` 계층으로 정리되어 있으며, MapStruct로 응답 DTO를 생성합니다.
- **보안**: Spring Security로 `SecurityFilterChain`을 구성하고, JWT 필터에서 토큰 검증과 인증 컨텍스트 주입을 일관되게 처리합니다. 비밀키는 `application.yml` 혹은 환경변수에서 주입하고, 테스트에서는 in-memory key를 사용하세요.
- **데이터 접근**: JPA 엔티티는 도메인 패키지의 `entity`에 둡니다. Repository는 `JpaRepository`/`Querydsl` 조합을 염두에 두고, 서비스 레이어에서 트랜잭션 경계를 관리합니다. MapStruct 매퍼는 `@Mapper(componentModel = "spring")`을 사용하고 DTO는 읽기/쓰기 모델로 분리합니다.
- **테스트**: `src/test/java`에서 도메인별로 패키지를 맞추고, 서비스는 `@DataJpaTest`, 웹 계층은 `@WebMvcTest` 혹은 통합 테스트로 검증하세요. JWT 관련 기능은 MockMvc로 시나리오 기반 테스트를 작성합니다.

## 커밋 및 PR 가이드라인
Conventional Commits(`feat:`, `fix:`, `refactor:` 등)을 사용하고, 한 커밋에 하나의 기능/수정을 담습니다. PR에는 변경 요약, 관련 이슈, 수행한 테스트(`npm run lint`, `./gradlew test`), UI 변경 시 스크린샷을 포함하세요.

## 환경 변수 및 보안 팁
프론트엔드와 백엔드 모두 `.env`나 `application-local.yml`에 비밀값을 저장하고 Git에 올리지 마세요. MSSQL 연결, JWT 시크릿, OAuth 키는 운영/테스트 별로 분리합니다. 스키마 변경 시 `db-sql` 디렉터리를 업데이트하고 마이그레이션 절차를 문서화하세요.

## 현황 정리

### 갖춰진 부분
- 프론트엔드는 `src/pages`에 홈·인증·포스트 작성/상세/마이페이지 라우트가 구현되고, `src/routes/AppRoutes.tsx`가 라우터 구성을 담당합니다. `App.tsx`+`components/Header.tsx`가 기본 레이아웃을 구성하며 Tailwind 스타일을 활용합니다.
- 인증 상태 관리는 `contexts/AuthContext.tsx`에서 JWT 저장/복원과 로그인·회원가입·로그아웃 로직을 모두 포함하고, `main.tsx`에서 전역 Provider로 주입됩니다.
- API 모듈은 `services/postsApi.ts`와 `services/authApi.ts`에서 CRUD 및 인증 요청을 래핑하며 `VITE_API_BASE_URL` 기본값(`config/api.ts`)을 사용합니다.
- 백엔드는 `auth`와 `posts` 도메인 패키지 아래에 entity/dto/repository/mapper/service/controller 계층이 구성되어 있고, MapStruct 매퍼(`auth/AuthMapper`, `posts/PostMapper`)를 통해 DTO 매핑을 처리합니다.
- Spring Security + JWT 구성이 `auth/config/SecurityConfig.java`, `auth/security/JwtAuthenticationFilter.java`, `auth/security/JwtTokenProvider.java`에 자리 잡고 있으며, `application.properties`에 CORS·DB·JWT 설정 값이 정의되어 있습니다.
- 초기 DB 스키마 초안은 `db-sql/initial_schema.sql`에 사용자/포스트/태그/댓글/메트릭 테이블 정의로 정리되어 있습니다.

### 갖춰지지 않은 부분
- 프론트엔드의 `src/hooks`, `src/data`, `src/context` 등 보조 디렉터리가 비어 있고, 댓글·해시태그 리스트·검색 결과 페이지와 같은 주요 UI 흐름이 아직 구현되지 않았습니다.
- 마크다운 미리보기는 단순 문자열 분할 수준이며, 실시간 렌더링/문법 하이라이트가 빠져 있고 이미지 업로드 등 에디터 부가기능도 없습니다.
- 백엔드에는 댓글, 좋아요, 조회수 증가, 태그 목록 API 등 스키마에 정의된 하위 도메인 로직이 구현되어 있지 않으며, PostMetrics 갱신 로직도 서비스 계층에서 사용되지 않습니다.
- 인증/포스트 도메인에 대한 단위·통합 테스트는 `contextLoads()` 외에 존재하지 않아 회귀 검증이 부족합니다.
- 운영/로컬 환경 분리를 위한 `.env.example` 또는 `application-local.yml` 템플릿, README 기반의 실행 가이드 보완이 필요합니다.

### 추가로 필요한 부분
- 댓글/좋아요/태그 관리 도메인을 백엔드에 추가하고, 이에 대응하는 프론트엔드 UI와 상태 관리 훅을 확장하세요.
- 게시글 본문 마크다운 → HTML 변환기(commonmark 등)와 코드 하이라이터를 도입하고, 에디터에 실시간 프리뷰·임시 저장 기능을 검토하세요.
- React Query(또는 SWR) 기반 데이터 캐싱, 에러 바운더리, 로딩 스켈레톤 등 UX 개선 컴포넌트를 도입해 API 연동 안정성을 높이세요.
- Spring `@DataJpaTest`/`@WebMvcTest`와 MockMvc 시나리오를 활용한 인증·게시글 통합 테스트, JWT 필터 단위 테스트를 작성하세요.
- 환경 변수 템플릿과 로컬 개발용 시드 스크립트(예: `npm run seed`, `./gradlew bootRun --args`)를 마련해 온보딩을 단순화하세요.
