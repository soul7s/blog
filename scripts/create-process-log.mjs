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
    .replace(/['"]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getSeoulNowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    time: `${read("hour")}:${read("minute")}`,
    seconds: read("second") || "00",
  };
}

function normalisePublishedAtInput(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    const now = getSeoulNowParts();
    return `${now.date}T${now.time}:${now.seconds}+09:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T09:00:00+09:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed.replace(" ", "T")}:00+09:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed.replace(" ", "T")}+09:00`;
  }

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  throw new Error(
    '발행 시각은 "YYYY-MM-DD HH:mm" 또는 ISO 형식으로 입력해 주세요.',
  );
}

function toTagLines(tags) {
  if (!tags.length) {
    return "tags:\n  - 기록";
  }

  return ["tags:", ...tags.map((tag) => `  - ${tag}`)].join("\n");
}

function toReferenceList(references) {
  if (!references.length) {
    return "- 참고 링크가 없다면, 어떤 자료를 기준으로 정리했는지 한 줄 메모";
  }

  return references.map((reference) => `- ${reference}`).join("\n");
}

function createTemplate({
  articleType,
  publishedAt,
  references,
  summary,
  tags,
  title,
}) {
  const openingLine =
    articleType === "review"
      ? "이 글은 감상문보다 판단 기록에 가깝다. 무엇이 좋았는지보다 어떤 기준으로 보고, 어디까지 추천할 수 있는지를 남긴다."
      : "이 글은 결과 자랑보다 작업 기록에 가깝다. 다음에 같은 일을 다시 할 때 빠르게 따라갈 수 있도록 순서와 판단 이유를 남긴다.";

  const reminderLine =
    articleType === "review"
      ? "정리하면, 이 글의 목적은 호불호를 크게 말하는 것이 아니라 어떤 사람에게 맞고 어떤 상황에서 애매한지까지 남기는 것이다."
      : "정리하면, 이 글의 목적은 무엇을 했는지보다 왜 그 순서로 했는지를 남겨 다음 작업 비용을 줄이는 것이다.";

  return `---
title: "${title}"
summary: "${summary}"
publishedAt: "${publishedAt}"
${toTagLines(tags)}
---

<!--
process-log writing rules
1. 한 문단은 1~3문장으로 짧게 쓴다.
2. 감상보다 과정, 과정보다 판단 근거를 우선한다.
3. "무엇을 했다" 다음에는 "왜 그렇게 했다"를 붙인다.
4. 막힌 지점, 수정 이유, 다시 볼 포인트를 꼭 남긴다.
5. 마지막에는 다음에 다시 볼 사람을 위한 메모를 적는다.
-->

> ${openingLine}

## 참고한 재료

${toReferenceList(references)}

## 이 글에서 남길 것

- 이 글이 다루는 작업이나 판단의 범위
- 읽는 사람이 바로 따라갈 수 있는 순서
- 나중에 다시 봤을 때 도움이 되는 기준

## 준비한 것

- 필요한 도구, 계정, 환경
- 시작 전에 이미 정해져 있던 조건
- 먼저 확인해야 하는 제한 사항

## 전체 흐름 한눈에 보기

1. 배경 정리
2. 실제로 한 일
3. 선택한 이유
4. 테스트와 수정
5. 적용 또는 배포

## 1. 시작 배경

왜 이 작업을 하게 됐는지, 무엇이 불편했는지 짧게 적는다.

## 2. 실제로 한 일

처음에 무엇부터 봤는지, 어떤 순서로 진행했는지 적는다.

## 3. 왜 그렇게 했는지

겉으로 보기에는 단순해 보여도, 실제로는 어떤 조건과 판단 기준이 있었는지 남긴다.

## 4. 테스트와 수정한 부분

직접 확인하면서 어색했던 점과 손본 이유를 적는다.

## 5. 적용 후 남는 메모

배포, 반영, 운영 관점에서 나중에 다시 봐야 할 포인트를 적는다.

## 다음에 다시 볼 메모

- 다음 번에는 무엇부터 확인할지
- 반복 실수를 줄이기 위한 기준 한 줄
- 중간에 놓치기 쉬운 체크포인트

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
  const title = initialArgs.title ?? (await rl.question("글 제목: ")).trim();
  const summary =
    initialArgs.summary ?? (await rl.question("한 줄 요약: ")).trim();
  const tagsInput =
    initialArgs.tags ??
    (await rl.question("태그 (쉼표로 구분, 비워도 됨): ")).trim();
  const referencesInput =
    initialArgs.references ??
    (await rl.question("참고 링크 (쉼표로 구분, 비워도 됨): ")).trim();
  const publishedAtInput =
    initialArgs["published-at"] ??
    initialArgs.publishedAt ??
    initialArgs.date ??
    (
      await rl.question(
        "발행 시각 (YYYY-MM-DD HH:mm, 비우면 현재 시각): ",
      )
    ).trim();
  const slug =
    initialArgs.slug ??
    (await rl.question("슬러그 (비우면 제목 기준 생성): ")).trim();

  await rl.close();

  return {
    category,
    publishedAtInput,
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

  const publishedAt = normalisePublishedAtInput(answers.publishedAtInput || "");
  const date = publishedAt.slice(0, 10);
  const slug = answers.slug || toSlug(answers.title);

  if (!slug) {
    throw new Error("슬러그를 만들 수 없습니다. --slug 값을 직접 넣어 주세요.");
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
    publishedAt,
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
