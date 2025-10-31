# Design Guidelines (Draft)

## 1. Design Goals
- **입문자 친화**: 과도한 장식보다 정보 위주의 카드형 UI.
- **일관성**: 카드/버튼/배경 톤을 통일해 페이지 간 이질감 축소.
- **확장성**: 이후 관리자·검색 등 기능 확장에도 재사용 가능한 컴포넌트 구조.

## 2. Color Tokens

| Token | Hex | 사용처 |
|-------|-----|--------|
| `--color-primary` | `#ff6b6b` | 액션 버튼, 강조 텍스트, 활성 탭 |
| `--color-primary-dark` | `#e05252` | 호버/액티브 상태 |
| `--color-secondary` | `#ffd166` | 보조 배지, 태그 백그라운드 |
| `--color-surface` | `#1f1f2e` | 카드/모달 배경 |
| `--color-background` | `#151521` | 페이지 전체 배경 |
| `--color-border` | `rgba(255,255,255,0.08)` | 카드/입력 필드 보더 |
| `--color-text-primary` | `#ffffff` | 본문 텍스트 |
| `--color-text-secondary` | `rgba(255,255,255,0.75)` | 부가 설명, 라벨 |
| `--color-text-tertiary` | `rgba(255,255,255,0.55)` | 메타 정보, 타임스탬프 |
| `--color-success` | `#4caf50` | 성공 메시지/뱃지 |
| `--color-error` | `#ff4d4f` | 에러 메시지 |

> 다크 테마를 기본값으로 유지하되, 라이트 테마가 필요하면 `--color-background` / `--color-surface` 만 교체하는 구조로 확장.

## 3. Typography

| 용도 | 폰트 | 사이즈/라인하이트 | 비고 |
|------|------|------------------|------|
| 페이지 타이틀 (`h1`) | Pretendard Bold | 32px / 40px | 모바일 ≤768px에서 24px |
| 섹션 타이틀 (`h2`) | Pretendard SemiBold | 24px / 32px | 카드 그룹 헤더 |
| 카드 타이틀 | Pretendard SemiBold | 18px / 26px | 두 줄 이상일 때 `line-clamp` |
| 본문 | Pretendard Regular | 16px / 24px | 기본 본문 |
| 보조 텍스트 | Pretendard Regular | 14px / 20px | 메타/라벨 |
| 캡션/태그 | Pretendard Medium | 12px / 16px | 대문자보다 소문자권장 |

폰트 스택 예시:  
`font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;`

## 4. Spacing & Layout
- 기본 그리드: 12컬럼 (데스크톱 기준 1200px 컨테이너, 옆 여백 24px).  
- Gap 토큰: `4 / 8 / 12 / 16 / 24 / 32 / 40`.  
- 카드 콘텐츠 패딩: 상하 20px, 좌우 24px.  
- 섹션 간 간격: 기본 60px, 모바일에서는 40px.
- 브레이크포인트:
  - `max-width: 1024px`: 2열 그리드 → 1.5열 (auto-fit).  
  - `max-width: 768px`: 단일 컬럼, 카드 폭 100%, 모달 full-screen.

## 5. Core Components (요약)

### 5.1 버튼
- 기본(`primary`): 풀 컬러 배경, 12px 라운드, 패딩 12/24.
- 서브(`secondary`): 투명 배경 + 보더, 호버 시 보더 컬러 강조.
- 아이콘 버튼: 원형 40px, 배경 `--color-surface`, 호버 시 `--color-border`.

### 5.2 카드
- 배경 `--color-surface`, 라운드 16px, 그림자 대신 보더 강조.
- 헤더(타이틀), 서브텍스트, 메타(태그/날짜), CTA 버튼 레이어로 구성.
- 이미지가 필요한 경우 상단 16:9 비율 유지, `object-fit: cover`.

### 5.3 리스트/테이블
- 데스크톱: 테이블 형태 가능, 모바일에서는 카드/아코디언 전환.
- 테이블 헤더 배경 `rgba(255,255,255,0.04)`, 행 호버 시 `rgba(255,255,255,0.02)`.

### 5.4 태그/칩
- 최상단 라벨 12px, 패딩 6/12, 배경 `rgba(255,255,255,0.08)`, 라운드 999px.
- 선택 상태는 `--color-secondary` 배경 + 텍스트 `#1f1f2e`.

### 5.5 상태 메시지
- 로딩: 스켈레톤(회색 블록) 또는 스피너.  
- 빈 상태: 일러스트 + 안내 문구 + CTA 버튼.  
- 에러: `--color-error` 텍스트, 재시도 버튼 포함.

## 6. 아이콘 & 이미지
- 단색 아이콘 위주(SVG). 필터 항목이나 액션 버튼에 사용.  
- 커뮤니티/아이템 이미지 썸네일은 가로 3:2 또는 1:1 비율로 통일.  
- 프로필/아바타: 원형 64px 기본, 목록에서는 40px.

## 7. 접근성 체크 포인트
- 텍스트 대비: 최소 4.5:1 유지 (`--color-text-secondary` 이상 사용).  
- 포커스 스타일: outline `2px solid rgba(255,107,107,0.7)` + `outline-offset: 2px`.  
- 키보드 탐색이 가능한지 컴포넌트 수준에서 확인.

## 8. 다음 단계
- Figma(또는 대체 툴)에서 **컴포넌트 라이브러리**와 **페이지 와이어프레임** 제작.  
- `frontend/assets/css/pages.css` 재구조화: 공통 토큰 → 페이지별 모듈 분리.  
- 리뉴얼 작업 들어가기 전, 이 문서를 팀과 공유해 합의 완료.

