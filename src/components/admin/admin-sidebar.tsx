import Link from 'next/link'
import { SidebarNav } from '@/components/admin/sidebar-nav'

export function AdminSidebar() {
  return (
    <aside className="bg-background hidden h-full w-60 flex-col border-r md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="text-lg font-bold">
          JiangsStock 관리자
        </Link>
      </div>

      <SidebarNav />
    </aside>
  )
}
