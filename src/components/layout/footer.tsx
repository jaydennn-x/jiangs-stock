import Link from 'next/link'
import { Container } from './container'

export function Footer() {
  return (
    <footer className="border-t">
      <Container>
        <div className="py-10">
          <div className="mb-6">
            <Link href="/">
              <span className="text-lg font-bold">JiangsStock</span>
            </Link>
            <p className="text-muted-foreground mt-1 text-sm">
              고품질 스톡 이미지를 합리적인 가격에 제공합니다.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-muted-foreground text-sm">
              © 2026 JiangsStock. All rights reserved.
            </p>
            <nav className="flex items-center gap-4">
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/license"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                라이선스 안내
              </Link>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  )
}
