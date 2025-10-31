# Backend Integration Checklist (Frontend 연동 준비)

## 1. 데이터베이스 & 마이그레이션
- [ ] 신규 테이블 DDL 작성: `timeline_event`, `live_event`, `live_setlist_item`, `item_category`, `item`, `item_media`.
- [ ] 기존 테이블 점검: `news_event`, `place`, `community_post` 등 컬럼 명세 최신 문서와 일치 여부 확인.
- [ ] 시드 데이터 계획: 각 도메인 최소 3건(연도별 대표) 준비, 문서 `docs/backend-seed-guide.md` 업데이트.
- [ ] 인덱스/외래키 설정 검토 (특히 `event_date`, `tour_name`, `category_id` 등 검색 필드).

## 2. Spring Boot 구조
- [ ] 엔티티/Repository 클래스 생성 (패키지: `com.aimyon.archive.domain.*`).
- [ ] DTO/Response 모델 작성 → 프런트 요구 필드와 일치하도록 설계.
- [ ] 서비스/UseCase 레이어에 필터/페이징 로직 구현.
- [ ] 컨트롤러(API) 스텁 생성: `GET /api/timeline-events`, `GET /api/live-events`, `GET /api/items`, `GET /api/search`.
- [ ] Swagger(Splringdoc) 문서 갱신해 프런트 참고 가능하도록 유지.

## 3. 공통 규약
- [ ] 에러 응답 포맷 통일 (status, message, code, timestamp).
- [ ] 날짜 포맷 ISO8601 (`yyyy-MM-dd`, `yyyy-MM-dd'T'HH:mm:ss`).
- [ ] 페이지네이션 응답 wrapper (`page`, `size`, `totalElements`, `totalPages`, `content`).
- [ ] CORS 설정 확인 (로컬 개발 시 `http://localhost:5500` 허용).

## 4. 테스트 & 검증
- [ ] 단위 테스트: 서비스 레이어 필터/정렬 검증.
- [ ] 통합 테스트: MockMvc/RestAssured로 API 스펙 검증.
- [ ] Postman/Insomnia 컬렉션 공유 (프런트 개발자가 바로 호출 가능).
- [ ] 성능 고려: 검색 API는 기본 limit(도메인별 5건) 적용.

## 5. 배포/환경 변수
- [ ] `application-local.yml`에 각 도메인용 설정(예: 기본 페이지 사이즈, 캐시) 추가.
- [ ] Google Maps API Key, DB 접속 정보 등 `.env`/환경 변수 관리 방안 정비.
- [ ] QA/스테이징 환경이 필요하면 DB 스냅샷/시드 자동화 스크립트 준비.

## 6. 커뮤니케이션
- [ ] API 변경 시 `docs/api-design.md` 갱신 후 공유.
- [ ] 프런트와 연동 일정 조율(진행 중 상태를 Notion/Trello 등에서 추적).
- [ ] 주요 릴리스마다 git tag 및 변경 로그 작성.

