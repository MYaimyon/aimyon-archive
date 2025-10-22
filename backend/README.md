# backend

Spring Boot API 서버 관련 리소스를 정리하는 디렉터리입니다.

## 구조
- imyon-archive-api/ : Spring Boot 3 (Java 17+) Gradle 프로젝트
- scripts/            : PostgreSQL 초기화 등 스크립트 자리

## 로컬 개발 절차
1. imyon-archive-api 진입 후 gradlew.bat build (Windows) 또는 ./gradlew build (macOS/Linux)로 기본 빌드 확인
2. Java 17 이상, Gradle Wrapper 사용
3. src/main/resources/application.yml에서 기본 프로필을 local로 지정
4. 로컬 환경 정보는 src/main/resources/application-local.yml에 작성
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
   server:
     port: 8080
   `
   (운영/배포 환경에서는 ddl-auto를 alidate로 전환하고, 비밀번호는 환경 변수로 주입하는 것을 권장합니다.)
5. 테스트 실행(gradlew test)은 H2 인메모리 DB를 사용합니다.

## 샘플 데이터 메모
- 초기 확인용 INSERT SQL은 docs/postgresql-setup.md에 정리되어 있습니다.
- 필요 시 DELETE FROM tracks;, DELETE FROM album_tags;, DELETE FROM albums; 순으로 제거하면 됩니다.

## 다음 단계
- PostgreSQL 로컬/배포 환경 정리 (pgAdmin/CLI 가이드)
- /api/albums, /api/tracks 외 추가 도메인 확장
- Spring Security를 통한 인증/권한 구조 설계

변경 사항이나 설정 추가 시 README.md와 docs/ 문서를 함께 업데이트해 주세요.
