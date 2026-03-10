/**
 * 웹사이트 스크래핑 스크립트
 * 사용법: npx tsx scripts/scrape/scrape-website.ts --url "https://example.com"
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

// ─── CLI 인자 파싱 ───────────────────────────────────────────────
function parseArgs(): { url: string } {
  const args = process.argv.slice(2)
  const urlIndex = args.indexOf('--url')
  if (urlIndex === -1 || !args[urlIndex + 1]) {
    console.error(
      '사용법: npx tsx scripts/scrape/scrape-website.ts --url <URL>'
    )
    process.exit(1)
  }
  return { url: args[urlIndex + 1] }
}

// ─── 도메인 → 파일명 변환 ──────────────────────────────────────
function domainToSlug(url: string): string {
  const { hostname } = new URL(url)
  return hostname.replace(/^www\./, '').replace(/\./g, '-')
}

// ─── 날짜 문자열 ───────────────────────────────────────────────
function dateStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// ─── 섹션 분할 (DOM 기반 1차 분할) ────────────────────────────
const SECTION_SELECTORS = [
  'header',
  'nav',
  'section',
  'article',
  'main > div',
  'footer',
  "[class*='hero']",
  "[class*='Hero']",
  "[class*='banner']",
  "[class*='feature']",
  "[class*='pricing']",
  "[class*='testimonial']",
  "[class*='cta']",
  "[class*='faq']",
  "[class*='footer']",
  "[class*='stats']",
  "[class*='logo']",
]

const MIN_SECTION_HEIGHT = 100 // px

interface SectionInfo {
  index: number
  selector: string
  category: string
  top: number
  bottom: number
  height: number
  html: string
  text: string
}

interface ImageInfo {
  src: string
  alt: string
  width: number
  height: number
}

interface VideoInfo {
  type: 'youtube' | 'html5' | 'vimeo'
  src: string
  thumbnail?: string
}

// ─── 카테고리 추론 ─────────────────────────────────────────────
function inferCategory(el: {
  tagName: string
  className: string
  id: string
  text: string
}): string {
  const tag = el.tagName.toLowerCase()
  const cls = (el.className + ' ' + el.id).toLowerCase()
  const text = el.text.toLowerCase()

  if (
    tag === 'header' ||
    tag === 'nav' ||
    cls.includes('nav') ||
    cls.includes('header')
  )
    return 'header'
  if (tag === 'footer' || cls.includes('footer')) return 'footer'
  if (
    cls.includes('hero') ||
    cls.includes('banner') ||
    cls.includes('jumbotron')
  )
    return 'hero'
  if (
    cls.includes('pricing') ||
    cls.includes('plan') ||
    text.includes('pricing')
  )
    return 'pricing'
  if (
    cls.includes('testimonial') ||
    cls.includes('review') ||
    cls.includes('feedback')
  )
    return 'testimonial'
  if (cls.includes('faq') || text.includes('frequently asked')) return 'faq'
  if (cls.includes('cta') || cls.includes('call-to-action')) return 'cta'
  if (cls.includes('contact') || cls.includes('form')) return 'contact'
  if (cls.includes('stat') || cls.includes('number') || cls.includes('metric'))
    return 'stats'
  if (cls.includes('logo') || cls.includes('partner') || cls.includes('client'))
    return 'logo-cloud'
  if (cls.includes('how') || cls.includes('step') || cls.includes('process'))
    return 'how-it-works'
  if (
    cls.includes('feature') ||
    cls.includes('benefit') ||
    cls.includes('service')
  )
    return 'feature'
  return 'feature'
}

// ─── 메인 ─────────────────────────────────────────────────────
async function main() {
  const { url } = parseArgs()
  const domain = domainToSlug(url)
  const date = dateStr()
  const outDir = path.join('public', 'scraped', `${domain}-${date}`)
  const sectionsDir = path.join(outDir, 'sections')
  const videosDir = path.join(outDir, 'videos')

  fs.mkdirSync(sectionsDir, { recursive: true })
  fs.mkdirSync(videosDir, { recursive: true })

  console.log(`\n[1/6] 브라우저 시작: ${url}`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  // 스크래핑 재시도
  let retries = 3
  while (retries > 0) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      break
    } catch (e) {
      retries--
      if (retries === 0) throw e
      console.log(`  재시도 중... (${3 - retries}/3)`)
      await page.waitForTimeout(2000)
    }
  }

  // 쿠키/팝업 닫기 시도
  const closeSelectors = [
    "[aria-label='Close']",
    "[class*='modal-close']",
    "[class*='cookie'] button",
    "[id*='cookie'] button",
    "[class*='popup-close']",
    "button[data-dismiss='modal']",
  ]
  for (const sel of closeSelectors) {
    try {
      const el = page.locator(sel).first()
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click()
        await page.waitForTimeout(500)
      }
    } catch {
      // 무시
    }
  }

  // 페이지 끝까지 스크롤 (lazy load 트리거, 최대 5 뷰포트)
  console.log('[2/6] 페이지 스크롤 중...')
  const viewportHeight = 900
  const MAX_SCROLL = viewportHeight * 5
  let scrolled = 0
  while (scrolled < MAX_SCROLL) {
    await page.evaluate(y => window.scrollBy(0, y), 300)
    scrolled += 300
    await page.waitForTimeout(100)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)

  console.log('[3/6] 전체 페이지 스크린샷...')
  await page.screenshot({
    path: path.join(outDir, 'full-page.png'),
    fullPage: true,
  })

  console.log('[4/6] HTML/CSS/DOM 수집...')
  const html = await page.content()
  fs.writeFileSync(path.join(outDir, 'page.html'), html)

  // 계산된 CSS (상위 100개 요소)
  const styles = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*')).slice(0, 100)
    return els.map(el => {
      const cs = window.getComputedStyle(el)
      return {
        tag: el.tagName,
        id: el.id,
        class: el.className,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
      }
    })
  })
  fs.writeFileSync(
    path.join(outDir, 'styles.json'),
    JSON.stringify(styles, null, 2)
  )

  // DOM 트리 (간략) - 문자열로 전달해 tsx __name 참조 회피
  const domTree = await page.evaluate(`
    (() => {
      const walk = (el, depth) => {
        if (depth > 4) return {};
        return {
          tag: el.tagName,
          id: el.id,
          class: (el.className || '').toString().slice(0, 80),
          children: Array.from(el.children).slice(0, 8).map(c => walk(c, depth + 1)),
        };
      };
      return walk(document.body, 0);
    })()
  `)
  fs.writeFileSync(
    path.join(outDir, 'dom-tree.json'),
    JSON.stringify(domTree, null, 2)
  )

  // 이미지 수집
  const images: ImageInfo[] = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .filter(img => img.naturalWidth > 50)
      .slice(0, 50)
      .map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      }))
  })
  fs.writeFileSync(
    path.join(outDir, 'images.json'),
    JSON.stringify(images, null, 2)
  )

  // 비디오 수집
  const videos: VideoInfo[] = await page.evaluate(() => {
    const result: VideoInfo[] = []
    // HTML5 video
    document.querySelectorAll('video').forEach(v => {
      result.push({ type: 'html5', src: v.src || v.currentSrc })
    })
    // YouTube iframe
    document.querySelectorAll('iframe').forEach(f => {
      if (f.src.includes('youtube') || f.src.includes('youtu.be')) {
        result.push({ type: 'youtube', src: f.src })
      }
      if (f.src.includes('vimeo')) {
        result.push({ type: 'vimeo', src: f.src })
      }
    })
    return result
  })
  fs.writeFileSync(
    path.join(outDir, 'videos.json'),
    JSON.stringify(videos, null, 2)
  )

  console.log('[5/6] 섹션 분할 중...')

  // DOM 기반 1차 섹션 분할
  const rawSections = await page.evaluate(
    ({ selectors, minHeight }) => {
      const seen = new Set<Element>()
      const results: {
        selector: string
        tagName: string
        className: string
        id: string
        top: number
        bottom: number
        height: number
        text: string
        html: string
      }[] = []

      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
          if (seen.has(el)) return
          // 부모가 이미 포함됐으면 스킵
          for (const s of seen) {
            if (s.contains(el)) return
          }
          const rect = el.getBoundingClientRect()
          const scrollTop = window.scrollY
          const top = rect.top + scrollTop
          const bottom = rect.bottom + scrollTop
          const height = bottom - top
          if (height < minHeight) return

          seen.add(el)
          results.push({
            selector: sel,
            tagName: el.tagName,
            className: el.className.toString().slice(0, 200),
            id: el.id,
            top,
            bottom,
            height,
            text: el.textContent?.slice(0, 300) || '',
            html: el.outerHTML.slice(0, 3000),
          })
        })
      }

      // top 기준 정렬
      results.sort((a, b) => a.top - b.top)

      // 중복 영역 제거 (80% 이상 겹치면 더 작은 것 제거)
      const deduped = results.filter((r, i) => {
        for (let j = 0; j < i; j++) {
          const prev = results[j]
          const overlapStart = Math.max(r.top, prev.top)
          const overlapEnd = Math.min(r.bottom, prev.bottom)
          const overlap = Math.max(0, overlapEnd - overlapStart)
          if (overlap / r.height > 0.8) return false
        }
        return true
      })

      return deduped
    },
    { selectors: SECTION_SELECTORS, minHeight: MIN_SECTION_HEIGHT }
  )

  // 카테고리 추론 및 섹션 스크린샷
  const sections: SectionInfo[] = []
  let index = 0

  for (const raw of rawSections.slice(0, 10)) {
    const category = inferCategory({
      tagName: raw.tagName,
      className: raw.className,
      id: raw.id,
      text: raw.text,
    })

    // 섹션 스크린샷
    const sectionPngPath = path.join(sectionsDir, `section-${index}.png`)
    const sectionHtmlPath = path.join(sectionsDir, `section-${index}.html`)

    try {
      await page.screenshot({
        path: sectionPngPath,
        clip: {
          x: 0,
          y: Math.max(0, raw.top),
          width: 1440,
          height: Math.min(raw.height, 3000),
        },
      })
    } catch {
      // 스크린샷 실패 시 전체 페이지 사용
      await page.screenshot({ path: sectionPngPath, fullPage: false })
    }

    fs.writeFileSync(sectionHtmlPath, raw.html)

    sections.push({
      index,
      selector: raw.selector,
      category,
      top: raw.top,
      bottom: raw.bottom,
      height: raw.height,
      html: raw.html,
      text: raw.text,
    })

    console.log(`  섹션 ${index}: [${category}] h=${Math.round(raw.height)}px`)
    index++
  }

  fs.writeFileSync(
    path.join(outDir, 'sections.json'),
    JSON.stringify(sections, null, 2)
  )

  console.log('[6/6] 완료!')
  console.log(`\n출력 디렉토리: ${outDir}`)
  console.log(`총 섹션: ${sections.length}개`)
  console.log(`\n섹션 요약:`)
  sections.forEach(s => {
    console.log(
      `  [${s.index}] ${s.category} (높이: ${Math.round(s.height)}px)`
    )
  })

  await browser.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
