function ipToNum(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0
  )
}

function cidrMatch(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/')
  const mask = bits ? (~0 << (32 - parseInt(bits, 10))) >>> 0 : 0xffffffff
  return (ipToNum(ip) & mask) === (ipToNum(range) & mask)
}

export function isIpAllowed(ip: string, allowedIps?: string): boolean {
  if (!allowedIps) {
    return process.env.NODE_ENV === 'development'
  }

  const entries = allowedIps.split(',').map(s => s.trim())
  return entries.some(entry =>
    entry.includes('/') ? cidrMatch(ip, entry) : ip === entry
  )
}
