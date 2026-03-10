/**
 * Registry 메타데이터 인덱스 빌드 스크립트
 * 사용법: npx tsx scripts/metadata-build.ts
 *
 * 생성 파일:
 *   public/generated/page-registry.json   - 페이지 레지스트리
 *   public/generated/page-index.json      - 페이지 → 섹션 매핑
 *   public/generated/section-to-page.json - 섹션 → 페이지 역참조
 */

import * as fs from 'fs'
import * as path from 'path'

const REGISTRY_DIR = path.join('src', 'components', 'registry')
const PAGES_DIR = path.join(REGISTRY_DIR, 'pages')
const OUT_DIR = path.join('public', 'generated')

interface SectionMeta {
  name: string
  category: string
  language: string
  parentPage: string
  source: string
  sectionIndex: number
  createdAt: string
  keywords: string[]
  tags: {
    functional: string[]
    style: string[]
    layout: string[]
    industry: string[]
  }
}

interface PageMeta {
  name: string
  type: string
  source: string
  createdAt: string
  sections: string[]
}

// ─── 간단한 YAML 파서 (flat key: value + list) ─────────────────
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = content.split('\n')
  let currentKey: string | null = null
  let currentList: string[] | null = null
  let inNestedSection: string | null = null
  let nestedObj: Record<string, string[]> = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    // 중첩 리스트 항목 (들여쓰기 4칸)
    if (line.startsWith('    - ') && inNestedSection && currentKey) {
      const val = trimmed.slice(2).replace(/^"|"$/g, '')
      if (!nestedObj[inNestedSection]) nestedObj[inNestedSection] = []
      nestedObj[inNestedSection].push(val)
      continue
    }

    // 중첩 섹션 키 (들여쓰기 2칸)
    if (
      line.startsWith('  ') &&
      !line.startsWith('    ') &&
      trimmed.endsWith(':')
    ) {
      if (inNestedSection !== null && currentKey) {
        // 이전 중첩 섹션 저장는 필요 없음 (이미 nestedObj에 쌓임)
      }
      inNestedSection = trimmed.slice(0, -1)
      continue
    }

    // 최상위 리스트 항목
    if (trimmed.startsWith('- ') && currentKey && !inNestedSection) {
      if (!currentList) {
        currentList = []
        result[currentKey] = currentList
      }
      currentList.push(trimmed.slice(2).replace(/^"|"$/g, ''))
      continue
    }

    // key: value 또는 key: (리스트 시작)
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx > 0) {
      // 중첩 obj 저장
      if (inNestedSection && currentKey) {
        const existing = (result[currentKey] as Record<string, string[]>) || {}
        result[currentKey] = { ...existing, ...nestedObj }
        nestedObj = {}
        inNestedSection = null
      }

      currentKey = trimmed.slice(0, colonIdx).trim()
      const val = trimmed.slice(colonIdx + 1).trim()

      if (!val || val === '') {
        // 리스트 또는 중첩 오브젝트 시작
        currentList = null
      } else {
        currentList = null
        inNestedSection = null
        const cleaned = val.replace(/^"|"$/g, '')
        const asNum = Number(cleaned)
        if (!isNaN(asNum) && cleaned !== '') {
          result[currentKey] = asNum
        } else if (cleaned === 'true') {
          result[currentKey] = true
        } else if (cleaned === 'false') {
          result[currentKey] = false
        } else {
          result[currentKey] = cleaned
        }
      }
    }
  }

  // 마지막 중첩 obj 저장
  if (inNestedSection && currentKey) {
    const existing = (result[currentKey] as Record<string, string[]>) || {}
    result[currentKey] = { ...existing, ...nestedObj }
  }

  return result
}

// ─── 메인 ─────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // 섹션 메타데이터 수집
  const sections: SectionMeta[] = []
  if (fs.existsSync(REGISTRY_DIR)) {
    for (const entry of fs.readdirSync(REGISTRY_DIR)) {
      if (entry === 'pages') continue
      const metaPath = path.join(REGISTRY_DIR, entry, 'metadata.yaml')
      if (!fs.existsSync(metaPath)) continue
      try {
        const raw = parseSimpleYaml(fs.readFileSync(metaPath, 'utf-8'))
        sections.push(raw as unknown as SectionMeta)
      } catch (e) {
        console.warn(`  ⚠️ 파싱 실패: ${metaPath}`)
      }
    }
  }

  // 페이지 메타데이터 수집
  const pages: PageMeta[] = []
  if (fs.existsSync(PAGES_DIR)) {
    for (const entry of fs.readdirSync(PAGES_DIR)) {
      const metaPath = path.join(PAGES_DIR, entry, 'metadata.yaml')
      if (!fs.existsSync(metaPath)) continue
      try {
        const raw = parseSimpleYaml(fs.readFileSync(metaPath, 'utf-8'))
        pages.push(raw as unknown as PageMeta)
      } catch (e) {
        console.warn(`  ⚠️ 파싱 실패: ${metaPath}`)
      }
    }
  }

  // page-registry.json
  fs.writeFileSync(
    path.join(OUT_DIR, 'page-registry.json'),
    JSON.stringify(pages, null, 2)
  )

  // page-index.json (페이지 → 섹션 배열)
  const pageIndex: Record<string, string[]> = {}
  for (const page of pages) {
    pageIndex[page.name] = page.sections || []
  }
  fs.writeFileSync(
    path.join(OUT_DIR, 'page-index.json'),
    JSON.stringify(pageIndex, null, 2)
  )

  // section-to-page.json (섹션 → 페이지 역참조)
  const sectionToPage: Record<string, string> = {}
  for (const section of sections) {
    if (section.parentPage) {
      sectionToPage[section.name] = section.parentPage
    }
  }
  fs.writeFileSync(
    path.join(OUT_DIR, 'section-to-page.json'),
    JSON.stringify(sectionToPage, null, 2)
  )

  console.log(`✅ Registry 인덱스 빌드 완료`)
  console.log(`   섹션: ${sections.length}개`)
  console.log(`   페이지: ${pages.length}개`)
  console.log(`   출력: ${OUT_DIR}/`)
}

main()
