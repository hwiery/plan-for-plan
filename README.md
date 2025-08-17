# PRD Generator

한 줄 아이디어를 실제 서비스로 변환하는 PRD 생성 서비스

## 개요

PRD Generator는 사용자가 입력한 간단한 한 줄 아이디어를 체계적인 역질문을 통해 구체화하고, Google Gemini 2.5 Pro API를 활용하여 실제 개발 가능한 상세한 PRD(Product Requirements Document)를 생성하는 SaaS 서비스입니다.

## 주요 기능

- 🎯 **체계적인 아이디어 구체화**: AI 기반 역질문을 통한 단계별 아이디어 발전
- 📋 **6개 분야 PRD 생성**: 프론트엔드, 백엔드, 데이터베이스, 보안, SEO, 퍼블리쉬
- 🚀 **즉시 구현 가능**: AI가 바로 개발할 수 있는 수준의 상세한 명세 제공
- ⚡ **빠른 결과**: 10-15분 만에 완성도 높은 PRD 생성

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 2.5 Pro API
- **Database**: PostgreSQL (예정)
- **ORM**: Prisma (예정)
- **Deployment**: Vercel (예정)

## 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd prd-generator
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일에서 필요한 환경 변수를 설정하세요:
- `GOOGLE_GEMINI_API_KEY`: Google Gemini API 키
- `DATABASE_URL`: 데이터베이스 연결 URL
- `NEXTAUTH_SECRET`: NextAuth 시크릿 키

4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 스크립트

- `npm run dev`: 개발 서버 실행 (Turbopack 사용)
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 실행
- `npm run format`: Prettier로 코드 포맷팅
- `npm run format:check`: 포맷팅 확인

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
├── components/          # 재사용 가능한 React 컴포넌트
├── hooks/              # 커스텀 React 훅
├── lib/                # 유틸리티 함수 및 설정
├── services/           # API 서비스 및 비즈니스 로직
└── types/              # TypeScript 타입 정의
```

## 개발 가이드

### 코드 스타일

- TypeScript 사용 필수
- Prettier를 사용한 코드 포맷팅
- ESLint 규칙 준수

### 커밋 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 수정

## 라이선스

MIT License