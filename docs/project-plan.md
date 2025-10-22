# Aimyon Archive — Project Plan

## 1. 프로젝트 개요
- 아이묭(Aimyon) 팬을 위한 비상업용 디지털 아카이브 (학습/포트폴리오용)
- MVP 마감: 2025-10-31 (예산 20,000원 이내)
- 핵심 가치: 입문자가 주요 음원·스토리·현장 정보를 한 번에 파악

## 2. 목표 & 범위 요약
- 음악: 앨범 → 곡 상세 흐름 + 가사 요약, 제작 비화, 인터뷰 발췌, 영상 임베드
- 스토리/미디어: 인터뷰, 방송, 라디오, 묭어록(브라우징)
- 묭지순례: 장소 설명 + 지도 + 인증샷 연계
- 묭아이템: 착용/추천 아이템 및 관련 콘텐츠
- 라이브/활동: 타임라인, 세트리스트, 차트·수상, 노래방 번호
- 커뮤니티: 짤방/팬아트, 후기, 인증샷, 투표, 자유게시판, 댓글·좋아요, 즐겨찾기
- 검색: 앨범·곡·장소·아이템·라이브 대상 (인터뷰/묭어록 제외)
- 관리자: CRUD, 이미지 업로드, YouTube 임베드, 회원가입/로그인(JWT), 권한 관리
- 제외(MVP): 오늘의 묭어록/오늘의 아이묭 랜덤 위젯

## 3. 디렉터리 구조
`
root/
├── frontend/      # 정적 HTML/CSS/JS 자산, 컴포넌트, fetch 연동 코드
├── backend/       # Spring Boot 3 (Java 17) 프로젝트, API, 서비스, 도메인, 보안 설정
├── docs/          # 기획, 설계, 진행 문서
├── CHANGELOG.md   # 변경 이력
└── README.md      # 요약, 실행 방법, 환경 설정 안내
`

### frontend/
- ssets/ : 공통 스타일, 스크립트, 이미지
- components/ : header/footer 등 재사용 UI 조각
- pages/ : index/디스코그래피/프로필/뉴스/앨범·곡 상세 등 화면별 HTML
- data/ (신규) : 초기 목업 JSON 혹은 정적 콘텐츠 (백엔드 연동 전 임시)
- 	ests/ (선택) : 정적 검증 스크립트나 Lighthouse 리포트 등

### backend/
- imyon-archive-api/ : Spring Boot 애플리케이션
  - src/main/java/... : config, domain, repository, service, controller
  - src/main/resources/ : pplication.yml, pplication-local.yml
  - uild.gradle
- scripts/ : 로컬 DB 초기화 등 보조 스크립트

### docs/
- project-plan.md (본 문서)
- system-design.md : 아키텍처/ERD/API 상세
- 
ext_tasks.md : 단기 작업 우선순위
- project_progress.md : 진행 상황 요약

## 4. 데이터 모델 초안 (PostgreSQL)
| Entity         | 주요 필드 | 관계 |
|----------------|-----------|------|
| Album          | id, title_ja, title_ko, release_date, type, cover_url, description | Album 1:N Track, Album 1:N Story |
| Track          | id, album_id, title_ja, title_ko, lyrics_summary, duration, mv_url | Track N:1 Album |
| Story          | id, album_id, track_id?, category, content, source, published_at | Story N:1 Album, optional Track |
| Place          | id, name, description, address, latitude, longitude, tips | Place 1:N PlaceMedia |
| PlaceMedia     | id, place_id, media_url, media_type, submitted_by | PlaceMedia N:1 Place |
| Item           | id, name, category, description, related_track_id?, purchase_link | Item optional Track link |
| LiveEvent      | id, title, event_date, venue, city, country, setlist(jsonb) | LiveEvent 1:N LiveMedia |
| CommunityPost  | id, user_id, category, title, content, media_urls(jsonb), likes_count | CommunityPost 1:N Comment |
| Comment        | id, post_id, user_id, parent_id?, content, created_at | 대댓글 parent_id로 연결 |
| User           | id, username, email, password_hash, role, status, created_at | User 1:N CommunityPost/Comment |

## 5. API 1차 우선순위
1. GET /api/albums (검색/필터 지원)
2. GET /api/albums/{id} (트랙, 관련 스토리, 미디어 포함)
3. GET /api/tracks / GET /api/tracks/{id}
4. /api/places 및 /api/places/{id}
5. 인증: POST /api/auth/login, POST /api/auth/register
6. 관리자 CRUD (/api/admin/**)
7. 커뮤니티 기본 (/api/community/posts, /api/community/posts/{id}/comments)

## 6. 기술 스택 & 규약
- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, PostgreSQL, Gradle
- 프런트 연동: fetch API 기반, 추후 SPA 전환 대비 모듈화
- Infra: (예정) AWS EC2/RDS/S3 — 초기엔 로컬 환경으로 실행
- 규약: RESTful API, JSON 응답, OpenAPI 도입 검토, .editorconfig로 코딩 컨벤션 관리

## 7. 진행 로드맵 (라이트)
1. 레포 정리, 정적 페이지 보완, docs 체계 재정비 *(ongoing)*
2. PostgreSQL 스키마 설계 + Hibernate ddl-auto=update 기반 테이블 생성
3. Spring Boot 기본 API(/api/albums, /api/tracks) 구현 및 테스트
4. 프런트 fetch 연동, 정적 데이터 제거, UI 개선
5. 커뮤니티/검색/관리자 기능 순차 개발
6. 통합 테스트 및 배포 전략 수립 (AWS 검토)

## 8. 역할 & 커뮤니케이션
- Codex: 설계/개발/문서 전담, 진행 상황 공유
- 진성: 오너(최종 의사결정)
- ChatGPT: 보조 설명/정리
- 커뮤니케이션: 커밋 메시지, docs 업데이트, 필요 시 회의 노트

## 9. 즉시 실행 TODO
- README 갱신: 실행 가이드 및 환경 설정 최신화
- 프런트 자산 인코딩/텍스트 정비, 공통 컴포넌트 재검토
- /api/albums, /api/tracks와 프런트 fetch 연동
- PostgreSQL 샘플 데이터 관리 방법(추가·삭제) 문서화
