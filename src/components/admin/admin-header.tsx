'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SidebarNav } from '@/components/admin/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'

const ADMIN_NAME = '관리자'

export function AdminHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-background flex h-16 items-center border-b px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">메뉴 열기</span>
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="flex h-16 justify-center border-b px-6">
            <SheetTitle>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-lg font-bold"
              >
                JiangsStock 관리자
              </Link>
            </SheetTitle>
          </SheetHeader>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center justify-end gap-3">
        <ThemeToggle />
        <span className="text-muted-foreground text-sm">{ADMIN_NAME}</span>
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">로그아웃</span>
        </Button>
      </div>
    </header>
  )
}
