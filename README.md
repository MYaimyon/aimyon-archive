# Aimyon Archive

아이묭(Aimyon) 입문자도 쉽게 탐색할 수 있는 팬 아카이브를 만드는 비상업·학습용 프로젝트입니다. MVP 목표 시점은 2025년 10월 말, 예산은 0원(필요 시 AWS 프리티어 최대 20,000원)입니다.

## 비전 & 핵심 가치
- 음악: 앨범 → 곡 상세 흐름, 가사 요약/스토리/라이브 영상까지 한 번에 파악
- 미디어: 인터뷰·방송·묭어록을 주제별로 모아 읽기 중심으로 제공
- 묭지순례 & 아이템: 지도/장소/인증샷, 착용·추천 아이템 큐레이션
- 활동 기록: 타임라인, 라이브 세트리스트, 차트·수상, 노래방 번호
- 커뮤니티: 팬아트, 후기, 인증샷, 자유게시판 등 참여형 공간
- 검색: 앨범/곡/장소/아이템/라이브 중심 빠른 탐색

## 정보 구조 (라우팅 계획)
`
/                홈
/music           음악 허브
  └ /albums      앨범 리스트
  └ /tracks/{id} 곡 상세
/media           인터뷰 & 미디어 (인터뷰/방송/묭어록)
/places          묭지순례 (지도/장소/인증샷)
/items           묭아이템
/timeline        활동 타임라인
/live            라이브 & 세트리스트
/records         차트 & 수상
/karaoke         노래방 번호
/community       커뮤니티 (팬아트/후기/인증샷/자유게시판)
/search          통합 검색 (앨범/곡/장소/아이템/라이브)
`

## MVP 범위
- 포함: 앨범→곡 상세, 미디어 읽기, 묭지순례, 아이템, 타임라인·라이브(텍스트), 커뮤니티(작성/댓글/좋아요), 간단 검색, 관리자 CRUD/이미지 업로드 (로그인은 2차 개발 가능)
- 제외: 오늘의 묭어록/랜덤 위젯 등 비핵심 부가 기능

## 데이터 모델 스케치
| Entity         | 설명                     | 관계 예시              |
|----------------|--------------------------|------------------------|
| Album          | 앨범 메타 데이터         | Album 1:N Track        |
| Track          | 곡 메타                   | Track 1:N Story        |
| Story          | 곡 비하인드/가사 요약    | Story N:1 Track        |
| Interview      | 인터뷰/미디어 요약·링크  | 독립                   |
| Place          | 묭지순례 장소(좌표 포함) | Place 1:N CommunityPost|
| Item           | 착용/추천 아이템         | 독립 (Track와 연계 가능)|
| LiveEvent      | 공연/세트리스트          | 독립                   |
| CommunityPost  | 커뮤니티 게시글          | Post 1:N Comment       |
| Comment        | 댓글/대댓글              | N:1 CommunityPost      |
| User           | 회원 정보                | User 1:N Post/Comment  |

## 검색 정책
- 대상: Album, Track, Place, Item, LiveEvent, CommunityPost(제목/태그)
- 제외: Interview, 묭어록 Quote (검색 부담 최소화)
- MVP: LIKE 기반 간단 검색 → 추후 전문 검색으로 확장 가능

## 기술 스택 계획
- Frontend: 기존 HTML/CSS/JS 자산 → 이후 JSP(View) + fetch()로 API 연동
- Backend: Java 21, Spring Boot 3 (Gradle 기반), Spring MVC/Security/JPA
- Database: PostgreSQL (로컬 개발 → AWS RDS로 이전)
- Infra: AWS EC2 t2.micro, RDS(PostgreSQL), S3(60일 후 Glacier 수명주기)

## 디렉터리 구조 (초안)
`
root/
├── frontend/            # 정적 자산 / 추후 JSP 마이그레이션 리소스
├── backend/             # Spring Boot API (생성 예정)
│   ├── aimyon-archive-api/
│   └── scripts/
├── docs/                # 기획·설계·진행 문서
├── README.md
└── CHANGELOG.md
`
- docs/project-plan.md : 전체 계획 및 로드맵
- docs/next_tasks.md   : 단기 우선 작업
- docs/project_progress.md : 진행 현황 및 리스크

## 진행 현황 (2025-10-16 기준)
- [x] 프로젝트 방향 정리 및 문서화 (README, docs/*)
- [ ] Spring Boot 프로젝트 생성 및 Gradle 설정
- [ ] PostgreSQL 스키마/마이그레이션 초안
- [ ] /api/albums, /api/tracks 기본 API 구현
- [ ] 프런트 fetch 연결 및 커뮤니티/검색/관리자 UI 기능화

## 향후 우선순위
1. Spring Boot 프로젝트 초기화 (Gradle) + 기본 API(/api/albums, /api/tracks)
2. PostgreSQL ERD 확정, Flyway/Liquibase 마이그레이션 파이프라인
3. 프런트 fetch() 유틸 모듈 작성 → 정적 데이터 제거 및 API 연동
4. 커뮤니티/검색/관리자 기능 세부 설계 및 구현 순차 진행
5. 테스트/문서 보강, 필요 시 AWS 배포 및 비용 모니터링

## 협업 & 역할
- Codex: 설계·개발·문서·테스트 전담, 진행 상황 공유
- 진성: 오너(최종 의사결정)
- ChatGPT: 참고 문답/설명 보조

중요 결정이나 진행상 변경은 docs/ 문서와 커밋 메시지로 꾸준히 기록합니다.

## Mock Preview
- [docs/mock-data-reference.md](docs/mock-data-reference.md) : Mock data IDs and usage for opening pages with `mock=1`