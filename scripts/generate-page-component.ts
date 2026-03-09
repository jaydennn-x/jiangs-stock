/**
 * Registry Page 컴포넌트 생성 스크립트
 * 사용법:
 *   npx tsx scripts/generate-page-component.ts \
 *     --name "example-com-landing" \
 *     --sections "example-com-header-0,example-com-hero-1,example-com-footer-2" \
 *     --source-url "https://example.com" \
 *     --scraped-dir "public/scraped/example-com-2024-01-01"
 */

import * as fs from "fs";
import * as path from "path";

// ─── CLI 인자 파싱 ───────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  const name = get("--name");
  const sections = get("--sections");
  const sourceUrl = get("--source-url");
  const scrapedDir = get("--scraped-dir");

  if (!name || !sections || !sourceUrl || !scrapedDir) {
    console.error("필수 인자: --name, --sections, --source-url, --scraped-dir");
    process.exit(1);
  }

  return {
    name,
    sections: sections.split(",").map((s) => s.trim()),
    sourceUrl,
    scrapedDir,
  };
}

// ─── PascalCase 변환 ───────────────────────────────────────────
function toPascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// ─── 날짜 ─────────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Page index.tsx 생성 ───────────────────────────────────────
function makePageComponent(pageName: string, sectionIds: string[]): string {
  const pascalPage = toPascalCase(pageName);
  const imports = sectionIds
    .map((id, i) => `import Section${i} from "@/components/registry/${id}";`)
    .join("\n");

  const usages = sectionIds.map((_, i) => `      <Section${i} />`).join("\n");

  return `${imports}

export default function ${pascalPage}() {
  return (
    <main>
${usages}
    </main>
  );
}
`;
}

// ─── Page metadata.yaml 생성 ──────────────────────────────────
function makePageMetadata(pageName: string, sectionIds: string[], sourceUrl: string): string {
  const sectionLines = sectionIds.map((id) => `  - "${id}"`).join("\n");
  return `name: "${pageName}"
type: "page"
source: "${sourceUrl}"
createdAt: "${today()}"
sections:
${sectionLines}
`;
}

// ─── 메인 ─────────────────────────────────────────────────────
function main() {
  const { name, sections, sourceUrl, scrapedDir } = parseArgs();

  const outDir = path.join("src", "components", "registry", "pages", name);
  fs.mkdirSync(outDir, { recursive: true });

  const componentCode = makePageComponent(name, sections);
  const metadataYaml = makePageMetadata(name, sections, sourceUrl);

  fs.writeFileSync(path.join(outDir, "index.tsx"), componentCode);
  fs.writeFileSync(path.join(outDir, "metadata.yaml"), metadataYaml);

  console.log(`✅ Page 컴포넌트 생성 완료: ${outDir}`);
  console.log(`   섹션: ${sections.join(", ")}`);
}

main();
