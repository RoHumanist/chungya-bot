# 청약알리미 — AI Context Document

> **이 문서를 먼저 읽고, 코드베이스를 파악한 뒤 작업하세요.**
> 프로젝트 경로: `C:\Users\skyat\OneDrive\바탕 화면\파일 모음\Vibe Coding\chungya-bot`

---

## ① 목적 (Why)

**한 줄:** 내 조건 한번 입력하면, 전국 청약 중 나에게 맞는 것만 알아서 알려주는 서비스.

**이걸 왜 만드는가:**
- 청약 정보는 청약홈(applyhome.co.kr)에 다 있지만, **까먹고 / 매번 확인하기 귀찮고 / 내 조건에 맞는지 모름**
- 기존에 이걸 해주는 서비스가 토스 앱인토스에 없음
- 핵심 가치: **탐색/확인 노동을 없애는 것**. 유저는 조건만 한번 입력하면 끝.

---

## ② 현재 상태 (AS-IS) — 2026-03-27 기준

### 완성된 기능
- **온보딩**: 토스 스타일 스텝별 UI (나이 → 혼인 → 주택 → 통장 → 소득 → 관심유형 → 지역)
- **조건 매칭 피드**: 유저 프로필 기반 필터링, 지원가능/불가능 판별
- **청약 상세 페이지**: 분양가, 일정(D-day + 상태뱃지), 자격조건, **유형별 전략 가이드** ("이렇게 넣으세요!"), **청약홈 신청 링크**
- **청약 목록**: 필터 칩 (전체/지원가능/민간/공공/청년/신혼/행복주택/오피스텔)
- **설정 페이지**: 조건 수정, 전국 지역 선택 (서울→구, 경기→시 자동 펼침)
- **DevTools**: 개발환경에서만 보이는 초기화/디버그 버튼 (빨간 D 버튼)

### 데이터 — 실데이터 연동 완료!
- **공공데이터포털 API 키 발급 완료** → `.env.local` + Vercel 환경변수에 설정됨
- API: 한국부동산원_청약홈 분양정보 조회 서비스 (전국 2,685건+)
- 5개 엔드포인트 병렬 호출: APT, 도시형, 잔여, 민간임대, 오피스텔
- 기간 지난 청약은 자동 필터링
- API 키 없으면 mock 데이터로 자동 폴백

### 배포
- **Vercel**: https://chungya-bot-dgqy.vercel.app/ (GitHub push 시 자동 배포)
- **GitHub**: https://github.com/RoHumanist/chungya-bot

### 디버깅 완료
- UX 감사: 온보딩 깜빡임, 뒤로가기, 저장버튼 겹침 등 6개 크리티컬 수정
- 보안 감사: XSS/인젝션 없음 확인. rate limiting 미적용 (마이너)

### 블로커
- **사업자 등록**: 토스 SDK 접근에 필요 → 아직 미등록
- **토스 SDK** (`@apps-in-toss/web-framework`): 사업자 등록 후 접근 가능
- **푸시 알림**: 토스 SDK 필요

### 알려진 마이너 이슈
- 숫자 입력에 음수/0 허용 (클램핑 없음)
- 저장 안 하고 나가면 경고 없음
- 상세페이지가 mock ID 기반 — 실데이터 ID와 매칭 안 됨 (수정 필요)
- API rate limiting 없음

---

## ③ 목표 상태 (TO-BE)

**MVP (1차) — 거의 완성:**
> 유저가 조건 입력 → 맞는 청약 피드 → 상세 확인 → 청약홈에서 바로 신청

**남은 것:**
- 상세페이지 실데이터 연동 (현재 mock만 봄)
- 토스 SDK → `.ait` 번들 → 앱인토스 출시

**2차 (수요 확인 후):**
- 시세차익 계산 (국토부 실거래가 API)
- 경쟁률 표시 (청약접수 경쟁률 조회 API)
- 푸시 알림 (새 청약, 마감 임박, 발표일)
- 커뮤니티/분위기 정보

---

## ④ 구조 (Structure)

### 기술 스택
- **프론트**: Next.js 15 (App Router) + Tailwind CSS + SWR
- **배포**: Vercel (GitHub 연동, push 시 자동 배포)
- **데이터**: 공공데이터포털 API → Next.js API Route → SWR → 클라이언트
- **상태**: React Context (ProfileProvider) + localStorage
- **타겟**: 토스 앱인토스 WebView (현재는 웹으로 운영)

### 디렉토리 구조
```
src/
├── app/
│   ├── page.tsx              # 홈 (온보딩 or 매칭 피드)
│   ├── providers.tsx         # Context Provider 래퍼
│   ├── layout.tsx            # 루트 레이아웃 + DevTools
│   ├── globals.css           # Tailwind + 토스 컬러 변수
│   ├── subscriptions/
│   │   ├── page.tsx          # 전체 목록 (필터 칩)
│   │   └── [id]/page.tsx     # 상세 (일정, 조건, 전략, 신청버튼)
│   ├── settings/page.tsx     # 내 조건 수정
│   └── api/subscriptions/route.ts  # API Route (mock ↔ 실데이터 전환점)
├── components/
│   ├── Onboarding.tsx        # 스텝별 온보딩 (8스텝)
│   ├── MatchedFeed.tsx       # 조건 매칭된 피드
│   ├── SubscriptionCard.tsx  # 청약 카드 컴포넌트
│   ├── ProfileForm.tsx       # 조건 수정 폼 (전국 지역 선택 포함)
│   ├── BottomNav.tsx         # 하단 네비게이션 (홈/청약/내조건)
│   ├── LoadingFeed.tsx       # 스켈레톤 로딩
│   └── DevTools.tsx          # 개발용 도구 (production에서 숨김)
├── lib/
│   ├── filter-context.tsx    # ProfileProvider (전역 상태 + localStorage)
│   ├── match.ts              # 매칭 로직 (순수 함수)
│   ├── api-client.ts         # 공공데이터 API 호출 (5개 엔드포인트 병렬)
│   ├── transform.ts          # API 응답 → Subscription 타입 변환
│   ├── mock-data.ts          # 테스트용 mock 데이터 (4건)
│   ├── use-subscriptions.ts  # SWR 훅 (캐싱, 에러 처리)
│   └── format.ts             # 가격/면적/날짜/D-day 포맷
└── types/
    └── subscription.ts       # 타입 정의 + DEFAULT_PROFILE
```

### 데이터 흐름
```
[공공데이터 API 5개 엔드포인트]
    → api/subscriptions/route.ts (서버)
    → transform.ts (API 응답 → Subscription[])
    → 기간 만료 건 필터링
    → JSON 응답
        ↓
[SWR (use-subscriptions.ts)] → Subscription[] (클라이언트 캐싱)
        ↓
[ProfileProvider] → UserProfile (localStorage)
        ↓
[match.ts] → MatchResult[] { sub, eligible, reasons[] }
        ↓
MatchedFeed / 목록 / 상세 렌더링
```

### 핵심 타입 (`types/subscription.ts`)
- `SubscriptionType`: 8종 (민간분양, 공공분양, 신혼희망타운, 청년특별공급, 행복주택, 국민임대, 장기전세, 오피스텔)
- `Subscription`: 청약 정보 (이름, 유형, 지역, 주소, 세대수, units[], schedule, conditions, specialTypes[])
- `UserProfile`: 유저 조건 (나이, 혼인, 주택상태, 통장, 소득, 자산, 관심지역[], 관심유형[])
- `MatchResult`: { sub, eligible, reasons[] }

---

## ⑤ 규칙 (Rules)

### 매칭 로직 (`match.ts`)
- 지역: `["__ALL__"]` = 전국, `[]` = 미선택(전체와 동일), `["서울 강남구"]` = 특정 지역
- 유형: `[]` = 전체, `["민간분양"]` = 선택한 것만
- 자격: 무주택/세대주/나이/소득/자산/통장 조건 하나라도 안 맞으면 `reasons`에 추가
- `eligible = reasons.length === 0`

### 지역 선택
- 서울/경기/인천은 하위 지역(구/시) 선택 가능 — 클릭하면 자동 펼침
- 나머지 광역시도는 시·도 단위 토글
- "전국 전체" = `["__ALL__"]`, 해제하면 `[]`

### API 전환
- `PUBLIC_DATA_API_KEY` 환경변수 있으면 → 실데이터
- 없으면 → mock 데이터 자동 폴백
- 전환점: `src/app/api/subscriptions/route.ts`

### 개발 규칙
- `npm run dev`로 로컬 실행 (포트 3000 또는 3001)
- `git push`하면 Vercel 자동 배포
- DevTools (빨간 D 버튼)는 `NODE_ENV === "development"`에서만 표시
- 과도한 기능 추가 금지 — MVP 집중

---

## ⑥ 역할 분담

- **Shawn (사람)**: 제품 방향, 앱인토스 등록, API 키 관리, QA
- **AI**: 코드 작성/수정, 디버깅, 빌드/배포
- **같이**: UI/UX 판단, 기능 우선순위

---

## ⑦ 예시 (유저 플로우)

**신규:** 앱 진입 → 온보딩 8스텝 → "청약 보러가기" → 매칭 피드 → 카드 클릭 → 상세 (전략 가이드 + 일정) → "청약홈에서 신청하기"

**기존:** 앱 진입 → 바로 매칭 피드 → 상세 → 신청. 조건 바뀌면 "내 조건" 탭에서 수정.

---

## ⑧ 제약/주의사항

- 과도한 기능 추가 금지 — MVP는 "맞는 청약 필터링 + 전략 + 신청 연결"
- 사업자 등록 없으면 토스 출시 불가 — 웹 버전으로 먼저 운영
- TDS(토스 디자인 시스템) 적용 필수 — 앱인토스 검수 기준
- API 호출 제한 — 공공데이터포털 일 1,000건
- localStorage에 소득/자산 저장됨 — 암호화 없음, 현재 허용 범위
- `.env.local`에 API 키 있음 — 커밋하면 안 됨 (.gitignore에 포함)

---

## ⑨ 피드백 기준

- 유저가 3분 안에 온보딩 끝내고 피드를 볼 수 있는가?
- 내 조건에 안 맞는 청약이 피드에 뜨는가? → 버그
- 청약 상세에서 "넣어야겠다" 판단 가능한 정보가 충분한가?
- 청약홈까지 2탭 이내로 갈 수 있는가?

---

## ⑩ 우선순위 기준

1. **유저 가치 직결** → 매칭 정확도, 전략, 신청 연결
2. **블로커 해소** → 사업자 등록, 토스 SDK
3. **UX 개선** → 디자인, 로딩, 에러 처리
4. **추가 기능** → 시세차익, 경쟁률, 커뮤니티 (수요 확인 후)

원칙: **"지금 유저한테 가치 있는 것"** 먼저.

---

## 다음 작업 (Next Steps)

### 즉시 가능
1. **상세페이지 실데이터 연동** — 현재 `[id]/page.tsx`가 `MOCK_SUBSCRIPTIONS`에서 find 하므로 실데이터 ID와 안 맞음. SWR 캐시 또는 API에서 개별 조회하도록 수정 필요.
2. **숫자 입력 클램핑** — 나이(0~120), 소득/자산(0~), 통장기간(0~600) 등
3. **저장 안 하고 페이지 이동 시 경고** — `beforeunload` 또는 라우트 변경 감지

### 사업자 등록 후
4. **토스 SDK 설치** → `npm install @apps-in-toss/web-framework` → `npx ait init` → `granite.config.ts` 설정
5. **TDS 설치** → `npm install @toss/tds-mobile` (검수 필수)
6. **Next.js static export** → `output: 'export'` (`.ait` 번들에 필요할 수 있음)
7. **`.ait` 빌드** → `npx granite build` → 콘솔 업로드 → 검토 요청

### 2차 기능
8. 경쟁률 API 연동 (공공데이터포털 2번 API)
9. 푸시 알림 (토스 SDK Bedrock 메시지)
10. 시세차익 계산 (국토부 실거래가 API)
