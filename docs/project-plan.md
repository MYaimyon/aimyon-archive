# Aimyon Archive — Project Plan

## 1. 프로젝트 개요
- 아이묭(Aimyon) 팬을 위한 비상업·학습용 디지털 아카이브
- MVP 마감: 2025-10-31 (예산 0원~20,000원 / AWS 프리티어 활용)
- 목표: 입문자가 음악/스토리/현장 정보를 빠르게 이해할 수 있는 허브 제공

## 2. 기능 범위 (MVP 기준)
- 음악: 앨범 → 곡 상세, 가사 요약/스토리/인터뷰/MV 연계
- 미디어: 인터뷰·방송·묭어록 브라우징
- 묭지순례: 장소 정보, 지도, 인증샷 연계
- 묭아이템: **후순위(확장 예정)** — MVP에서는 제외
- 라이브·타임라인: 활동 타임라인, 세트리스트, 차트/수상, 노래방 번호
- 커뮤니티: 짤/팬아트, 후기, 인증샷, 투표, 자유게시판, 댓글·좋아요, 즐겨찾기
- 검색: 앨범/곡/장소/아이템/라이브 대상 (인터뷰/묭어록 제외)
- 관리자: CRUD, 이미지 업로드, YouTube 임베드, 회원가입/로그인(JWT), 권한 관리
- 제외(MVP): 랜덤 위젯, 묭아이템 세부 구현, 기타 부가 기능

## 3. 디렉터리 구조
`
root/
├── frontend/      # 정적 자산, 컴포넌트, 페이지별 HTML/JS
├── backend/       # Spring Boot API (Java 17)
├── docs/          # 기획·설계·진행 문서
├── CHANGELOG.md   # 변경 이력
└── README.md      # 요약/실행 방법/환경 설정 안내
`

## 4. 데이터 모델 (초안)
| Entity        | 주요 필드                               | 관계 예시                     |
|---------------|------------------------------------------|-------------------------------|
| Album         | id, title_ja/ko, type, release_date 등    | Album 1:N Track / Story        |
| Track         | id, album_id, title, track_no, duration   | Track N:1 Album                |
| Story         | id, album_id, track_id?, category, content| Story N:1 Album (Track optional)|
| Place         | id, name, description, lat/lng            | Place 1:N PlaceMedia           |
| PlaceMedia    | id, place_id, media_url                   | PlaceMedia N:1 Place           |
| LiveEvent     | id, title, event_date, setlist(jsonb)     | LiveEvent 1:N LiveMedia        |
| CommunityPost | id, user_id, category, content, likes     | Post 1:N Comment               |
| Comment       | id, post_id, parent_id?, content          | Comment self-relation (thread) |
| User          | id, username, email, password_hash, role  | User 1:N Post/Comment          |

## 5. API 1차 우선순위
1. GET /api/albums, GET /api/albums/{id}
2. GET /api/tracks, GET /api/tracks/{id}
3. GET /api/places, GET /api/places/{id}
4. /api/community/** (목록·작성·댓글)
5. /api/admin/** CRUD + 인증/권한
6. 추후 확장: 검색 통합, 라이브, 스토리 모듈 등

## 6. 기술 스택 & 규약
- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, PostgreSQL, Gradle
- Frontend: HTML/CSS/JS (fetch 기반), 향후 리디자인 및 SPA 전환 고려
- ORM: Hibernate (ddl-auto=update로 로컬 테이블 생성, 운영 환경은 alidate 예정)
- Infra(예정): AWS EC2/RDS/S3 — MVP 완료 후 배포
- 규약: RESTful API, JSON 응답, OpenAPI 도입 검토, .editorconfig 운영

## 7. 진행 로드맵 (라이트)
1. 프런트 구조 정리 + docs 업데이트 *(진행 중)*
2. Album/Track API 구현 및 프런트 fetch 연동 *(진행 중)*
3. Story/Place/Llive 등 도메인 확장 + 커뮤니티/관리자 API
4. 프런트 리뉴얼(디자인/UX) + 검색 통합
5. 인증·보안, 테스트 강화, 배포 자동화(AWS)

## 8. 역할 & 커뮤니케이션
- Codex: 설계/개발/문서 전담
- 진성: 오너 / 최종 결정
- ChatGPT: 자료 정리·설명 서포트
- 커뮤니케이션: 커밋/PR, docs 업데이트, 필요 시 회의 노트

## 9. 즉시 실행 TODO (2025-10-22 기준)
- /api/albums/{id} 연동: lbum-detail.html fetch 적용
- Track 상세/검색 API 정비 및 프런트 연결
- 커뮤니티/검색/관리자 요구사항 세부화 및 설계 문서화
- 샘플 데이터 → 실제 데이터 수집 계획 수립
