import { CreditCard } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PaymentMethodPlaceholder() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          결제 수단 선택
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-gray-50">
            <input type="radio" name="payment" defaultChecked readOnly />
            <span className="text-sm font-medium">카드 결제</span>
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-gray-50">
            <input type="radio" name="payment" readOnly />
            <span className="text-sm font-medium">간편 결제</span>
          </label>
        </div>
        <p className="text-muted-foreground text-xs">
          * 실제 결제 연동 예정 (PG 위젯 placeholder)
        </p>
      </CardContent>
    </Card>
  )
}
