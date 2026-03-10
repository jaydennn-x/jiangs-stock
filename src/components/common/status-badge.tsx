import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProcessingStatus } from '@/types/enums'

const STATUS_CONFIG: Record<
  ProcessingStatus,
  {
    label: string
    className?: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  PENDING: { label: '대기중', variant: 'secondary' },
  PROCESSING: { label: '처리중', variant: 'default' },
  COMPLETED: {
    label: '완료',
    className: 'bg-green-500 text-white hover:bg-green-500/80',
  },
  FAILED: { label: '실패', variant: 'destructive' },
}

interface StatusBadgeProps {
  status: ProcessingStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
