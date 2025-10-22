# PostgreSQL 로컬 환경 가이드

Spring Boot 백엔드가 사용할 로컬 PostgreSQL 환경을 구축하는 절차입니다. Docker 없이 설치형(PostgreSQL Installer 등)을 기준으로 설명합니다.

## 1. 설치 확인
1. Windows: 시작 > PostgreSQL 폴더에서 SQL Shell (psql) 또는 pgAdmin 4가 보이면 설치되어 있는 것입니다.
2. macOS/Homebrew: rew services list | grep postgresql로 서비스 상태를 확인합니다.
3. 버전 확인: 터미널에서 psql --version

설치가 되어 있지 않다면 [https://www.postgresql.org/download/](https://www.postgresql.org/download/)에서 OS에 맞는 설치 프로그램을 받아 기본 옵션으로 설치합니다.

## 2. 서비스 실행 상태 확인
- Windows : services.msc에서 postgresql-x.x 서비스가 실행 중인지 확인하고, 필요하면 시작(Start)합니다.
- macOS/Homebrew : rew services start postgresql@15 (설치 버전에 맞게 조정)
- 실행 중인지 점검: pg_isready

## 3. 전용 데이터베이스 및 계정 생성
psql을 관리자 계정(기본값 postgres)으로 실행합니다.

`ash
psql -U postgres
`

아래 명령으로 Aimyon Archive 전용 데이터베이스와 사용자를 만듭니다. (필요한 이름·비밀번호로 수정하세요.)

`sql
CREATE DATABASE aim_archive;
CREATE USER aim WITH ENCRYPTED PASSWORD '1234';
GRANT ALL PRIVILEGES ON DATABASE aim_archive TO aim;
`

## 4. 연결 확인
다음 명령으로 새 사용자로 접속이 되는지 확인합니다.

`ash
psql -h localhost -U aim -d aim_archive
`

접속에 성공하면 \c 명령으로 현재 DB를 확인할 수 있습니다. 빠져나올 때는 \q.

## 5. Spring Boot 설정 연동
Flyway 없이 Hibernate가 테이블을 자동으로 생성합니다. ackend/aimyon-archive-api/src/main/resources/application-local.yml에 아래처럼 실제 접속 정보를 채웁니다.

`yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/aim_archive
    username: aim
    password: "1234"
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect
`

ddl-auto: update 덕분에 엔티티 정의에 맞춰 테이블이 자동으로 생성·갱신됩니다. 실제 서비스 단계에서는 alidate로 전환하거나 마이그레이션 도구를 도입하는 것을 권장합니다.

## 6. 샘플 데이터 관리
테스트용으로 다음 SQL을 넣으면 앨범과 트랙이 생성됩니다. 필요하면 값은 수정하세요.

`sql
-- 앨범
INSERT INTO albums (title_ja, title_ko, album_type, release_date, description, cover_url) VALUES
  ('青春のエキサイトメント', '청춘의 엑사이트먼트', 'ALBUM', '2017-09-13', '아이묭의 정규 1집', 'https://example.com/covers/seishun.jpg'),
  ('瞬間的シックスセンス', '순간적 식스센스', 'ALBUM', '2019-02-13', '히트곡이 다수 수록된 두 번째 정규 앨범', 'https://example.com/covers/shunkan.jpg');

-- 태그
INSERT INTO album_tags (album_id, tag) VALUES
  (1, 'J-POP'), (1, '포크'), (2, '록'), (2, 'J-POP');

-- 트랙
INSERT INTO tracks (album_id, title_ja, title_ko, track_no, duration, lyrics_summary, mv_url) VALUES
  (1, '愛を伝えたいだとか', '사랑을 전하고 싶다거나', 1, '03:58', '사랑에 대한 솔직한 고백', 'https://youtube.com/watch?v=dmefMfHu9gM'),
  (1, '君はロックを聴かない', '너는 록을 듣지 않아', 2, '04:02', '자신의 취향과 정체성을 담은 곡', 'https://youtube.com/watch?v=QkojZqM5w8A');
`

샘플 데이터를 지우고 싶을 때는 아래와 같이 삭제합니다.

`sql
DELETE FROM tracks;
DELETE FROM album_tags;
DELETE FROM albums;
`

## 7. 문제 해결 팁
| 증상 | 확인 사항 |
|------|-----------|
| psql: could not connect to server | 서비스 실행 여부 (pg_isready, Services) |
| FATAL: password authentication failed | 사용자/비밀번호 재확인, pg_hba.conf의 METHOD가 md5인지 |
| 포트 충돌 | 기본 포트 5432 사용 불가 시 postgresql.conf에서 포트 변경 후 pplication-local.yml도 일치시킨다 |

---
필요 시 docs/project-plan.md나 README에도 환경 정보를 갱신해 주세요.
