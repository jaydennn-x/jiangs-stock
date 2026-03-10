type StrengthScore = 0 | 1 | 2 | 3 | 4

const STRENGTH_MAP: Record<StrengthScore, { label: string; colorClass: string }> = {
  0: { label: '', colorClass: '' },
  1: { label: '약', colorClass: 'text-red-500' },
  2: { label: '보통', colorClass: 'text-orange-500' },
  3: { label: '강', colorClass: 'text-blue-500' },
  4: { label: '매우 강', colorClass: 'text-green-600' },
}

export function calcPasswordStrength(password: string): StrengthScore {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-zA-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++
  return score as StrengthScore
}

export function getStrengthInfo(score: StrengthScore): { label: string; colorClass: string } {
  return STRENGTH_MAP[score]
}

export function getStrengthPercent(score: StrengthScore): number {
  return score * 25
}
