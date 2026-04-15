# Markdown Static Blog

프로젝트 폴더 안의 마크다운 파일을 읽어 정적으로 배포하는 Next.js 블로그 템플릿입니다.  
현재 기본 카테고리는 `AI`, `자동화`, `경제`, `리뷰`, `기타` 다섯 가지로 잡혀 있습니다.

## 실행

```bash
npm.cmd install
npm.cmd run dev
```

브라우저에서 `http://localhost:3000`을 열면 블로그가 보입니다.

## 콘텐츠 폴더 구조

카테고리 폴더는 운영 편의를 위해 ASCII 폴더명으로 두고, 화면에는 한국어 라벨로 출력됩니다.

```text
content/
  ai/
    2026-04-15-building-an-ai-note-system.md
  automation/
    2026-04-14-automating-weekly-admin-work.md
  economy/
    2026-04-13-weekly-economy-notes.md
  review/
    2026-04-12-review-template-for-tools.md
  misc/
    2026-04-11-small-notes-worth-saving.md
```

허용 파일명 패턴:

```text
YYYY-MM-DD-제목.md
```

## 카테고리 규칙

- `ai` → `AI`
- `automation` → `자동화`
- `economy` → `경제`
- `review` → `리뷰`
- `misc` → `기타`

첫 번째 폴더는 반드시 위 다섯 카테고리 중 하나여야 합니다.  
원하면 `content/ai/agents/...` 같은 하위 폴더를 더 둘 수 있고, 화면에는 `AI / agents`처럼 보입니다.

## frontmatter 예시

```md
---
title: "AI 실험 로그를 쌓는 방법"
summary: "짧은 메모가 흩어지지 않도록 개인 AI 실험 로그를 정리하는 방식입니다."
tags:
  - GPT
  - 프롬프트
  - 실험노트
---

> 카드 요약 아래에 이어지는 본문입니다.

## 본문 제목

- 리스트
- 표
- 코드 블록
```

`title`, `summary`, `tags`는 선택이지만, 목록 카드 품질을 위해 넣는 것을 권장합니다.  
`date`는 파일명에서 자동으로 읽고, frontmatter에 적는 경우 파일명 날짜와 같아야 합니다.

## 수정 포인트

- 사이트 제목과 작성자 정보: `lib/site-config.ts`
- 카테고리 검증과 마크다운 로더: `lib/blog.ts`
- 홈 화면: `app/page.tsx`
- 목록 인터랙션: `components/article-explorer.tsx`
- 글 상세 페이지: `app/articles/[...slug]/page.tsx`

## 배포

1. GitHub 저장소에 푸시합니다.
2. Vercel에서 저장소를 연결합니다.
3. 빌드 명령은 기본값인 `next build`를 그대로 사용합니다.
4. 이 프로젝트는 `output: "export"` 설정으로 정적 HTML을 생성합니다.
