import { format, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'EEEE, MMMM d, yyyy')
  } catch { return 'Invalid Date' }
}

export const formatShortDate = (date) => {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'MMM d, yyyy')
  } catch { return 'Invalid Date' }
}

export const formatInputDate = (date) => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'yyyy-MM-dd')
  } catch { return '' }
}

export const getNextSunday = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? 0 : 7 - day
  const sunday = new Date(today)
  sunday.setDate(today.getDate() + diff)
  return format(sunday, 'yyyy-MM-dd')
}