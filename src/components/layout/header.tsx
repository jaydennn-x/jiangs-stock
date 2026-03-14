'use client'

import { useState } from 'react'
import { Menu, ShoppingCart, Heart, Receipt, User, LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SearchInput } from '@/components/search/search-input'
import { ThemeToggle } from '@/components/theme-toggle'
import { useCartStore } from '@/stores/cart-store'
import { Container } from './container'

function CartButton() {
  const items = useCartStore(state => state.items)
  const count = items.length

  return (
    <div className="relative">
      <Link href="/cart">
        <Button variant="ghost" size="icon" aria-label="장바구니">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </Link>
      {count > 0 && (
        <Badge
          variant="destructive"
          className="pointer-events-none absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-xs"
        >
          {count}
        </Badge>
      )}
    </div>
  )
}

function AuthMenu({ userName, userRole }: { userName?: string | null; userRole?: string }) {
  const handleLogout = () => signOut({ callbackUrl: '/' })
  const isAdmin = userRole === 'ADMIN'

  if (!userName) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">로그인</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
          <User className="h-4 w-4" />
          {userName}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                관리자 대시보드
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            위시리스트
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mypage/orders" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            구매 내역
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mypage/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />내 정보
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileMenu({ userName, userRole }: { userName?: string | null; userRole?: string }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const isAdmin = userRole === 'ADMIN'
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
    close()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>JiangsStock</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <SearchInput placeholder="이미지 검색..." />
          <div className="border-t pt-4">
            {userName ? (
              <nav className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-2 py-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  {userName}
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="hover:bg-accent rounded-sm px-2 py-2 text-sm transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      관리자 대시보드
                    </span>
                  </Link>
                )}
                <Link
                  href="/wishlist"
                  onClick={close}
                  className="hover:bg-accent rounded-sm px-2 py-2 text-sm transition-colors"
                >
                  위시리스트
                </Link>
                <Link
                  href="/mypage/orders"
                  onClick={close}
                  className="hover:bg-accent rounded-sm px-2 py-2 text-sm transition-colors"
                >
                  구매 내역
                </Link>
                <Link
                  href="/mypage/profile"
                  onClick={close}
                  className="hover:bg-accent rounded-sm px-2 py-2 text-sm transition-colors"
                >
                  내 정보
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:bg-accent rounded-sm px-2 py-2 text-left text-sm text-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </nav>
            ) : (
              <nav className="flex flex-col gap-2">
                <Link href="/login" onClick={close}>
                  <Button variant="outline" className="w-full">
                    로그인
                  </Button>
                </Link>
              </nav>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Header() {
  const { data: session } = useSession()
  const userName = session?.user?.name || session?.user?.email?.split('@')[0]
  const userRole = session?.user?.role

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold">JiangsStock</span>
          </Link>

          {/* 데스크톱 전용: 검색 */}
          <div className="hidden md:contents">
            <SearchInput
              className="max-w-sm flex-1"
              placeholder="이미지 검색..."
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <CartButton />
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="위시리스트">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            {/* 데스크톱 전용: 인증 메뉴 */}
            <div className="hidden md:flex md:items-center md:gap-2">
              <AuthMenu userName={userName} userRole={userRole} />
            </div>
            <ThemeToggle />
            {/* 모바일 전용: 햄버거 메뉴 */}
            <div className="md:hidden">
              <MobileMenu userName={userName} userRole={userRole} />
            </div>
          </div>
        </div>
      </Container>
    </header>
  )
}
