'use client'

import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { Menu, ShoppingCart, Heart, Receipt, User, LogOut } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SearchInput } from '@/components/search/search-input'
import { useCartStore } from '@/stores/cart-store'
import { dummyCategories } from '@/lib/dummy/categories'
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

function CategoryNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm">
            카테고리
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-48 gap-1 p-2">
              {dummyCategories.map(cat => (
                <li key={cat.id}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/search?category=${cat.slug}`}
                      className="hover:bg-accent block rounded-sm px-3 py-2 text-sm transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface AuthMenuProps {
  isLoggedIn: boolean
  onLogin: () => void
  onLogout: () => void
}

function AuthMenu({ isLoggedIn, onLogin, onLogout }: AuthMenuProps) {
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onLogin}>
          로그인
        </Button>
        <Link href="/signup">
          <Button size="sm">회원가입</Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">유</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
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
          onClick={onLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface MobileMenuProps {
  isLoggedIn: boolean
  onLogout: () => void
}

function MobileMenu({ isLoggedIn, onLogout }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

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
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              카테고리
            </p>
            <nav className="flex flex-col gap-1">
              {dummyCategories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  onClick={close}
                  className="hover:bg-accent rounded-sm px-2 py-2 text-sm transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t pt-4">
            {isLoggedIn ? (
              <nav className="flex flex-col gap-1">
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
                  onClick={() => {
                    onLogout()
                    close()
                  }}
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
                <Link href="/signup" onClick={close}>
                  <Button className="w-full">회원가입</Button>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold">JiangsStock</span>
          </Link>

          {!isMobile && <CategoryNav />}

          {!isMobile && (
            <SearchInput
              className="max-w-sm flex-1"
              placeholder="이미지 검색..."
            />
          )}

          <div className="ml-auto flex items-center gap-2">
            <CartButton />
            {!isMobile && (
              <AuthMenu
                isLoggedIn={isLoggedIn}
                onLogin={() => setIsLoggedIn(true)}
                onLogout={() => setIsLoggedIn(false)}
              />
            )}
            {isMobile && (
              <MobileMenu
                isLoggedIn={isLoggedIn}
                onLogout={() => setIsLoggedIn(false)}
              />
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
