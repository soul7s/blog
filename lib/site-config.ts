export type CategoryKey =
  | "ai"
  | "automation"
  | "economy"
  | "review"
  | "misc";

export type BlogCategory = {
  key: CategoryKey;
  label: string;
  description: string;
};

export const blogCategories: BlogCategory[] = [
  {
    key: "ai",
    label: "AI",
    description: "모델, 프롬프트, 에이전트, 워크플로우 실험을 정리합니다.",
  },
  {
    key: "automation",
    label: "자동화",
    description: "반복 작업을 줄이는 스크립트와 운영 루틴을 모읍니다.",
  },
  {
    key: "economy",
    label: "경제",
    description: "시장 흐름, 소비, 지표, 돈의 움직임에 대한 생각을 기록합니다.",
  },
  {
    key: "review",
    label: "리뷰",
    description: "도구, 서비스, 책, 제품을 써본 뒤 남기는 판단입니다.",
  },
  {
    key: "misc",
    label: "기타",
    description: "분류 밖에 있지만 남길 가치가 있는 메모를 모읍니다.",
  },
];

export const blogCategoryMap = new Map(
  blogCategories.map((category) => [category.key, category]),
);

export const siteConfig = {
  title: "생각과 작업을 쌓는 모아님의 블로그",
  description:
    "AI, 자동화, 경제, 리뷰, 기타 다섯 카테고리로 기록을 정리하는 마크다운 기반 정적 블로그입니다.",
  authorLead: "이것저것",
  authorAccent: "모아",
  authorTail: "만든 아카이브",
  authorIcon: "✦",
  statusLabel: "카테고리형 블로그",
  countSuffix: "개의 글",
  feedTitle: "최근 글",
} as const;
