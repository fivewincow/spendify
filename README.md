# Spendify

개인 가계부 웹 애플리케이션입니다. 영수증 이미지와 함께 수입/지출 내역을 관리할 수 있습니다.

## 주요 기능

- 수입/지출 내역 등록 및 관리
- 영수증 이미지 첨부
- 월별 거래 내역 조회
- 수입/지출 요약 통계
- 정렬 및 보기 모드 변경

## 기술 스택

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase
- **Date Handling**: date-fns

## 시작하기

### 필수 조건

- Node.js 18 이상
- pnpm

### 설치

```bash
pnpm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 연결 정보를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

### 빌드

```bash
pnpm build
```

### 프로덕션 실행

```bash
pnpm start
```

## 프로젝트 구조

```
src/
├── app/           # Next.js App Router 페이지
├── components/    # React 컴포넌트
├── hooks/         # 커스텀 훅
├── lib/           # 유틸리티 및 설정
└── types/         # TypeScript 타입 정의
```

## 라이선스

MIT
