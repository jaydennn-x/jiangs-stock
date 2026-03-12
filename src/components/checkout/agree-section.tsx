import Link from 'next/link'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export interface AgreeState {
  payment: boolean
  privacy: boolean
  terms: boolean
}

interface AgreeSectionProps {
  agreed: AgreeState
  onChange: (key: 'payment' | 'privacy' | 'terms', value: boolean) => void
}

export function AgreeSection({ agreed, onChange }: AgreeSectionProps) {
  const allAgreed = agreed.payment && agreed.privacy && agreed.terms

  function handleAllChange(checked: boolean) {
    onChange('payment', checked)
    onChange('privacy', checked)
    onChange('terms', checked)
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="agree-all"
          checked={allAgreed}
          onCheckedChange={checked => handleAllChange(checked === true)}
        />
        <Label htmlFor="agree-all" className="cursor-pointer font-semibold">
          전체 동의
        </Label>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="agree-payment"
            checked={agreed.payment}
            onCheckedChange={checked => onChange('payment', checked === true)}
          />
          <Label
            htmlFor="agree-payment"
            className="cursor-pointer text-sm font-normal"
          >
            (필수) 결제 진행 동의
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="agree-privacy"
            checked={agreed.privacy}
            onCheckedChange={checked => onChange('privacy', checked === true)}
          />
          <Label
            htmlFor="agree-privacy"
            className="cursor-pointer text-sm font-normal"
          >
            (필수){' '}
            <Link href="/privacy" className="hover:text-foreground underline">
              개인정보 수집
            </Link>{' '}
            이용 동의
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="agree-terms"
            checked={agreed.terms}
            onCheckedChange={checked => onChange('terms', checked === true)}
          />
          <Label
            htmlFor="agree-terms"
            className="cursor-pointer text-sm font-normal"
          >
            (필수){' '}
            <Link href="/terms" className="hover:text-foreground underline">
              이용약관
            </Link>{' '}
            동의
          </Label>
        </div>
      </div>
    </div>
  )
}
