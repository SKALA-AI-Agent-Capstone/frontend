// 'YYYY-MM-DD' 또는 ISO → 'YYYY.MM.DD'
export function formatDate(value) {
  if (!value) return '-'
  const raw=String(value)
  const normalized=/^\d{8}$/.test(raw) ? `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}` : value
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return String(value).replaceAll('-', '.')
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

// ISO → 'YYYY.MM.DD HH:mm'
export function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${formatDate(value)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatFileSize(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}

export function formatNumber(n) {
  return Number(n ?? 0).toLocaleString('ko-KR')
}

let seq = 0
export function uid(prefix = 'ID') {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}${seq.toString(36)}`.toUpperCase()
}
