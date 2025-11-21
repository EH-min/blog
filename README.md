# Next.js Blog with Supabase

Next.js 16 (App Router) + TypeScript + Supabase를 사용한 블로그 프로젝트입니다.

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, @tailwindcss/typography
- **Database**: Supabase (PostgreSQL)
- **Markdown**: react-markdown, remark-gfm, rehype-highlight, rehype-slug
- **Comments**: Giscus (GitHub Discussions)
- **Animation**: Framer Motion

## 시작하기

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 대시보드에서 **Settings** > **API**로 이동합니다.
3. `Project URL`과 `anon/public` 키를 복사합니다.

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Giscus (선택 사항)
NEXT_PUBLIC_GISCUS_REPO=your-username/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=your-repo-id
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your-category-id
```

`.env.local.example` 파일을 참고하세요.

Giscus 설정 방법은 `GISCUS_SETUP.md`를 참고하세요.

### 3. 데이터베이스 스키마 생성

Supabase 대시보드에서 **SQL Editor**로 이동하여 `supabase-schema.sql` 파일의 내용을 실행합니다.

이 스크립트는 다음을 생성합니다:
- `posts` 테이블
- 필요한 인덱스
- Row Level Security (RLS) 정책
- 샘플 데이터 (선택 사항)

### 4. 개발 서버 실행

의존성을 설치하고 개발 서버를 실행합니다:

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 주요 기능

### 📝 게시글 관리
- Supabase를 통한 실시간 데이터 관리
- Markdown 문법 지원 (GFM 포함)
- 코드 하이라이팅 (GitHub Dark 테마)
- 시리즈 기능
- 태그 시스템

### 🎨 UI/UX
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 다크모드 지원
- 부드러운 애니메이션
- @tailwindcss/typography를 활용한 아름다운 타이포그래피

### 📑 게시글 상세 페이지
- **TOC (Table of Contents)**: 자동 생성되는 목차
  - 데스크톱: 우측 고정 사이드바
  - 모바일: 접이식 목차
  - 현재 섹션 자동 하이라이트
- **이전/다음 글 네비게이션**
- **Giscus 댓글 시스템**: GitHub Discussions 기반
- **코드 블록**: 구문 하이라이팅, 스크롤바 커스터마이징
- **GFM 지원**: 표, 체크박스, 취소선 등

## 설정 가이드

- **Supabase 설정**: `SUPABASE_SETUP.md` 참고
- **Giscus 댓글 설정**: `GISCUS_SETUP.md` 참고

## 프로젝트 구조

```
next-blog/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지 (게시글 목록)
│   └── post/[slug]/
│       └── page.tsx        # 게시글 상세 페이지
├── components/
│   ├── Giscus.tsx          # 댓글 시스템
│   ├── Layout.tsx          # 레이아웃 컴포넌트
│   ├── PostCard.tsx        # 게시글 카드
│   ├── PostNavigation.tsx  # 이전/다음 글
│   ├── ProfileCard.tsx     # 프로필 카드
│   ├── TableOfContents.tsx # 목차 (TOC)
│   └── ThemeProvider.tsx   # 테마 제공자
├── lib/
│   └── supabase.ts         # Supabase 클라이언트
├── services/
│   └── postService.ts      # 게시글 관련 서비스
└── types.ts                # TypeScript 타입 정의
```

## 배포

### Vercel (권장)

1. GitHub 저장소에 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 Import
3. 환경 변수 설정 (`.env.local` 내용)
4. 배포 완료!

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참고하세요.

## 라이선스

MIT

## 기여

이슈와 PR을 환영합니다!
