import { format, parseISO, isAfter, isBefore } from 'date-fns'
import type { ActivityType, WhereaboutStatus } from './types'

export function computeStatus(startDate: string, endDate: string): WhereaboutStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  end.setHours(23, 59, 59, 999)
  if (isBefore(end, today)) return 'completed'
  if (isAfter(start, today)) return 'upcoming'
  return 'ongoing'
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  offsite_training: 'Offsite Training',
  certification: 'Certification',
  vendor_meeting: 'Vendor Meeting',
  customer_meeting: 'Customer Meeting',
  vendor_event: 'Vendor Event',
  customer_support: 'Customer Support',
  other: 'Other',
}

export const ACTIVITY_COLORS: Record<ActivityType, { bg: string; text: string; dot: string }> = {
  offsite_training: { bg: 'var(--c-train-bg)', text: 'var(--c-train)', dot: 'var(--c-train)' },
  certification:    { bg: 'var(--c-cert-bg)',  text: 'var(--c-cert)',  dot: 'var(--c-cert)' },
  vendor_meeting:   { bg: 'var(--c-vendor-bg)', text: 'var(--c-vendor)', dot: 'var(--c-vendor)' },
  customer_meeting: { bg: 'var(--c-customer-bg)', text: 'var(--c-customer)', dot: 'var(--c-customer)' },
  vendor_event:     { bg: 'var(--c-event-bg)',  text: 'var(--c-event)',  dot: 'var(--c-event)' },
  customer_support: { bg: 'var(--c-support-bg)', text: 'var(--c-support)', dot: 'var(--c-support)' },
  other:            { bg: 'var(--c-other-bg)',   text: 'var(--c-other)',   dot: 'var(--c-other)' },
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  if (startDate === endDate) return format(start, 'd MMM yyyy')
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth())
      return `${format(start, 'd')}–${format(end, 'd MMM yyyy')}`
    return `${format(start, 'd MMM')}–${format(end, 'd MMM yyyy')}`
  }
  return `${format(start, 'd MMM yyyy')}–${format(end, 'd MMM yyyy')}`
}

export function getDayCount(startDate: string, endDate: string): number {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const h12 = hour % 12 || 12
  return `${h12}:${m}${ampm}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
