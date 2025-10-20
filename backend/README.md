# backend

Spring Boot 3 (Java 21) 애플리케이션을 구성할 디렉터리입니다.

## 구성 계획
- imyon-archive-api/: 메인 애플리케이션 모듈 (Gradle 기반 예정)
- scripts/: 로컬 개발용 스크립트 (PostgreSQL 초기화, 마이그레이션 등)

## 초기화 TODO
1. Gradle 기반 Spring Boot 프로젝트 생성 (groupId: com.aimyon.archive 제안)
2. pplication-local.yml에 PostgreSQL 접속 정보 정의
3. Flyway 또는 Liquibase 마이그레이션 설정 추가
4. /api/albums, /api/tracks 기본 엔드포인트 구현

> Java 21 및 Gradle 8.x 환경을 요구합니다. 프로젝트 생성 후 README.md와 docs 문서를 업데이트하세요.
