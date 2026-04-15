import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const CATEGORY_CHOICES = {
  ai: "AI",
  automation: "자동화",
  economy: "경제",
  review: "리뷰",
  misc: "기타",
};

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function toSlug(value) {
  return value
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[‘’'"]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTagLines(tags) {
  if (!tags.length) {
    return 'tags:\n  - 기록';
  }

  return ["tags:", ...tags.map((tag) => `  - ${tag}`)].join("\n");
}

function toReferenceList(references) {
  if (!references.length) {
    return "- 참고 링크나 자료가 있다면 여기에 추가";
  }

  return references.map((reference) => `- ${reference}`).join("\n");
}

function createTemplate({
  title,
  summary,
  tags,
  references,
  articleType,
}) {
  const openingLine =
    articleType === "review"
      ? "이 글은 감상문보다 판단 기록에 가깝다. 나중에 같은 대상을 다시 볼 때, 무엇이 좋았고 무엇이 아쉬웠는지 빠르게 떠올리려고 남겨둔다."
      : "이 글은 감상보다 작업 기록에 가깝다. 다음에 같은 작업을 다시 할 때, 어디서 막혔고 무엇을 먼저 해야 하는지 헷갈리지 않으려고 순서대로 남겨둔다.";

  const reminderLine =
    articleType === "review"
      ? "정리하면, 핵심은 좋고 나쁨을 말하는 것이 아니라 어떤 사람에게 왜 맞거나 안 맞는지를 남기는 것이다."
      : '정리하면, 핵심은 "무엇을 했는지"보다 "왜 그 순서로 했는지"를 남겨서 다음 작업 비용을 줄이는 것이다.';

  return `---
title: "${title}"
summary: "${summary}"
${toTagLines(tags)}
---

<!--
process-log writing rules
1. 한 문단은 1~3문장으로 짧게 쓴다.
2. 감상보다 작업 기록, 판단 기록, 복기 메모에 가깝게 쓴다.
3. "무엇을 했다" 다음에는 "왜 그렇게 했다"를 붙인다.
4. 과장된 표현보다 실제 순서, 기준, 실수를 적는다.
5. 마지막에는 다음에 다시 볼 사람을 위한 체크리스트를 남긴다.
-->

> ${openingLine}

## 참고한 자료

${toReferenceList(references)}

## 이 글에서 다루는 것

- 이 글이 어떤 작업이나 판단을 다루는지 한 줄로 적기
- 독자가 이 글을 읽고 무엇을 바로 따라 할 수 있는지 적기

## 준비물

- 필요한 도구
- 필요한 계정이나 환경
- 시작 전에 알고 있어야 할 것

## 전체 흐름 한눈에 보기

1. 첫 단계
2. 두 번째 단계
3. 테스트나 검토
4. 마무리

## 1. 시작 배경

<!-- 여기서는 왜 이 작업을 하게 됐는지, 어떤 문제가 있었는지 짧게 쓴다. -->
이 작업을 시작한 이유와 당시 상황을 적는다.

## 2. 실제로 한 일

<!-- 여기서는 실제로 무엇을 했는지 순서대로 쓴다. -->
처음에 무엇을 했고, 왜 그 순서를 택했는지 적는다.

## 3. 이 선택이 실제로 뜻하는 것

<!-- 단순 작업 설명이 아니라, 그 선택이 어떤 구조를 만든 것인지 풀어쓴다. -->
겉으로 보기엔 단순한 선택이지만 실제로 어떤 조건을 만족시키는지 정리한다.

## 4. 테스트하고 수정한 부분

<!-- 초안이나 첫 시도에서 어색했던 점, 다시 손본 이유를 적는다. -->
직접 확인하면서 어색했던 지점과 수정한 이유를 남긴다.

## 5. 적용하거나 배포한 방식

<!-- 로컬에서 끝나지 않고 실제 적용까지 이어졌다면 그 흐름을 적는다. -->
정리된 결과를 어디에 반영했고, 이후 관리가 어떻게 쉬워졌는지 적는다.

## 실수하지 않으려고 남기는 메모

- 다음에 다시 할 때 꼭 먼저 확인할 것
- 먼저 정해두면 편한 규칙
- 중간에 헷갈리기 쉬운 지점

## 마무리

${reminderLine}
`;
}

async function promptForMissingValues(initialArgs) {
  const rl = readline.createInterface({ input, output });

  const categoryChoicesText = Object.entries(CATEGORY_CHOICES)
    .map(([key, label]) => `${key}(${label})`)
    .join(", ");

  const category =
    initialArgs.category ??
    (await rl.question(`카테고리 [${categoryChoicesText}]: `)).trim();
  const title =
    initialArgs.title ?? (await rl.question("글 제목: ")).trim();
  const summary =
    initialArgs.summary ?? (await rl.question("한 줄 요약: ")).trim();
  const tagsInput =
    initialArgs.tags ??
    (await rl.question("태그 (쉼표로 구분, 비워도 됨): ")).trim();
  const referencesInput =
    initialArgs.references ??
    (await rl.question("참고 링크 (쉼표로 구분, 비워도 됨): ")).trim();
  const date =
    initialArgs.date ??
    (await rl.question("날짜 (YYYY-MM-DD, 비우면 오늘): ")).trim();
  const slug =
    initialArgs.slug ??
    (await rl.question("슬러그 (비우면 제목 기준 생성): ")).trim();

  await rl.close();

  return {
    category,
    date,
    referencesInput,
    slug,
    summary,
    tagsInput,
    title,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const answers = await promptForMissingValues(args);

  const category = answers.category;

  if (!Object.hasOwn(CATEGORY_CHOICES, category)) {
    throw new Error(
      `카테고리는 ${Object.keys(CATEGORY_CHOICES).join(", ")} 중 하나여야 합니다.`,
    );
  }

  if (!answers.title) {
    throw new Error("제목은 비워둘 수 없습니다.");
  }

  if (!answers.summary) {
    throw new Error("요약은 비워둘 수 없습니다.");
  }

  const date =
    answers.date ||
    new Date().toISOString().slice(0, 10);

  const slug = answers.slug || toSlug(answers.title);

  if (!slug) {
    throw new Error("슬러그를 만들 수 없습니다. --slug 값을 직접 넣어주세요.");
  }

  const tags = answers.tagsInput
    ? answers.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const references = answers.referencesInput
    ? answers.referencesInput
        .split(",")
        .map((reference) => reference.trim())
        .filter(Boolean)
    : [];

  const fileName = `${date}-${slug}.md`;
  const targetDirectory = path.join(process.cwd(), "content", category);
  const targetPath = path.join(targetDirectory, fileName);

  fs.mkdirSync(targetDirectory, { recursive: true });

  if (fs.existsSync(targetPath)) {
    throw new Error(`이미 같은 경로의 글이 있습니다: ${targetPath}`);
  }

  const articleType = category === "review" ? "review" : "process";
  const template = createTemplate({
    articleType,
    references,
    summary: answers.summary,
    tags,
    title: answers.title,
  });

  fs.writeFileSync(targetPath, template, "utf8");

  output.write(`초안 파일을 만들었습니다.\n${targetPath}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
