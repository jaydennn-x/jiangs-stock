import Link from 'next/link'
import { Package, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const QUICK_LINKS = [
  {
    href: '/admin/products',
    icon: Package,
    title: '상품 관리',
    description: '이미지 등록, 수정, 삭제',
  },
  {
    href: '/admin/orders',
    icon: ShoppingBag,
    title: '주문 관리',
    description: '주문 조회 및 상태 확인',
  },
]

export function DashboardQuickLinks() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {QUICK_LINKS.map(({ href, icon: Icon, title, description }) => (
        <Link key={href} href={href}>
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
