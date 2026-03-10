'use client'

import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { Menu, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Container } from './container'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">JiangsStock</span>
            </Link>

            {!isMobile && (
              <nav className="flex items-center gap-4">
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  검색
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="장바구니">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {!isMobile && (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}

            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">메뉴 열기</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <nav className="flex flex-col gap-4 pt-8">
                    <Link
                      href="/search"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-foreground text-sm font-medium"
                    >
                      검색
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-foreground text-sm font-medium"
                    >
                      장바구니
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-foreground text-sm font-medium"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-foreground text-sm font-medium"
                    >
                      회원가입
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
