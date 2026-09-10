'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { db } from '@/lib/supabase'
import { StaffSearch } from './StaffSearch'
import { ActivityBadge } from './ui/ActivityBadge'
import { ACTIVITY_LABELS, todayISO } from '@/lib/utils'
import type { Staff, ActivityType, Whereabout } from '@/lib/types'

const ACTIVITY_TYPES: ActivityType[] = [
  'offsite_training', 'certification', 'vendor_meeting', 'customer_meeting', 'vendor_event',
]

const schema = z.object({
  location: z.string().min(2, 'Location is required'),
  description: z.string().optional(),
  is_all_day: z.boolean(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
}).refine(d => d.end_date >= d.start_date, {
  message: 'End date must be on or after start date',
  path: ['end_date'],
})

type FormValues = z.infer<typeof schema>

interface ActivityFormProps {
  initial?: Whereabout
  preselectedStaffId?: string
}

export function ActivityForm({ initial, preselectedStaffId }: ActivityFormProps) {
  const router = useRouter()
  const isEdit = !!initial
  const hasPreselected = !!preselectedStaffId

  const [step, setStep] = useState(isEdit ? 3 : hasPreselected ? 2 : 1)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(
    initial?.staff ?? null
  )
  const [staffError, setStaffError] = useState('')
  const [activityType, setActivityType] = useState<ActivityType | null>(
    initial?.activity_type ?? null
  )
  const [activityError, setActivityError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      location: initial?.location ?? '',
      description: initial?.description ?? '',
      is_all_day: initial?.is_all_day ?? false,
      start_date: initial?.start_date ?? todayISO(),
      end_date: initial?.end_date ?? todayISO(),
      start_time: initial?.start_time ?? '',
      end_time: initial?.end_time ?? '',
      notes: initial?.notes ?? '',
    },
  })

  const isAllDay = watch('is_all_day')
  const startDate = watch('start_date')

  function goStep2() {
    if (!selectedStaff) { setStaffError('Select a staff member'); return }
    setStaffError('')
    setStep(2)
  }

  function goStep3() {
    if (!activityType) { setActivityError('Select an activity type'); return }
    setActivityError('')
    setStep(3)
  }

  async function onSubmit(values: FormValues) {
    if (!activityType) return
    const staffId = selectedStaff?.staff_id ?? initial?.staff_id ?? preselectedStaffId
    if (!staffId) return

    setSubmitting(true)
    setSubmitError('')

    const payload = {
      staff_id: staffId,
      activity_type: activityType,
      location: values.location,
      description: values.description || null,
      is_all_day: values.is_all_day,
      start_date: values.start_date,
      end_date: values.end_date,
      start_time: values.is_all_day ? null : (values.start_time || null),
      end_time: values.is_all_day ? null : (values.end_time || null),
      notes: values.notes || null,
    }

    try {
      if (isEdit && initial) {
        const { error } = await db.from('whereabouts').update(payload).eq('id', initial.id)
        if (error) throw error
        router.push(`/log/${initial.id}`)
      } else {
        const { data, error } = await db.from('whereabouts').insert(payload).select().single()
        if (error) throw error
        router.push(`/log/${data.id}`)
      }
      router.refresh()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Check your Supabase connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Progress indicator */}
      {!isEdit && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {(hasPreselected ? [2, 3] : [1, 2, 3]).map(n => (
            <div key={n} style={{
              height: 4, flex: 1, borderRadius: 99,
              background: step >= n ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      )}

      {/* Step 1: Staff selection */}
      {!isEdit && step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4,
            }}>Who is this for?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Search by name or Staff ID</p>
          </div>
          <StaffSearch value={selectedStaff} onChange={setSelectedStaff} error={staffError} />
          <button type="button" className="btn btn-primary" onClick={goStep2} style={{ alignSelf: 'flex-start' }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Activity type */}
      {!isEdit && step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4,
            }}>What type of activity?</h2>
            {selectedStaff && (
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                For {selectedStaff.staff_name} ({selectedStaff.staff_id})
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACTIVITY_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setActivityType(type)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${activityType === type ? 'var(--accent)' : 'var(--border)'}`,
                  background: activityType === type ? 'var(--accent-bg)' : 'var(--surface)',
                  transition: 'border-color 0.15s, background 0.15s',
                  textAlign: 'left',
                }}
              >
                <ActivityBadge type={type} />
                {activityType === type && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
          {activityError && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{activityError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            {!hasPreselected && (
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            )}
            <button type="button" className="btn btn-primary" onClick={goStep3}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Details form */}
      {(step === 3 || isEdit) && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!isEdit && (
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-barlow, sans-serif)',
                  fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4,
                }}>Where and when?</h2>
                <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                  {selectedStaff?.staff_name} · <ActivityBadge type={activityType!} size="sm" />
                </p>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="label" htmlFor="location">Location *</label>
              <input
                id="location"
                className="input"
                placeholder="e.g. Suntec Convention Centre, Singapore"
                {...register('location')}
              />
              {errors.location && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.location.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label" htmlFor="description">Description</label>
              <input
                id="description"
                className="input"
                placeholder="Brief purpose (optional)"
                {...register('description')}
              />
            </div>

            {/* Date range */}
            <div className="form-grid-2" style={{ gap: 12 }}>
              <div>
                <label className="label" htmlFor="start_date">Start Date *</label>
                <input
                  id="start_date"
                  type="date"
                  className="input"
                  {...register('start_date')}
                  onChange={e => {
                    setValue('start_date', e.target.value)
                    const end = watch('end_date')
                    if (!end || end < e.target.value) setValue('end_date', e.target.value)
                  }}
                />
              </div>
              <div>
                <label className="label" htmlFor="end_date">End Date *</label>
                <input
                  id="end_date"
                  type="date"
                  className="input"
                  min={startDate}
                  {...register('end_date')}
                />
                {errors.end_date && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.end_date.message}</p>}
              </div>
            </div>

            {/* All-day toggle */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', userSelect: 'none',
            }}>
              <input type="checkbox" {...register('is_all_day')} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: 14, color: 'var(--text-2)' }}>All-day event</span>
            </label>

            {/* Times */}
            {!isAllDay && (
              <div className="form-grid-2" style={{ gap: 12 }}>
                <div>
                  <label className="label" htmlFor="start_time">Start Time</label>
                  <input id="start_time" type="time" className="input" {...register('start_time')} />
                </div>
                <div>
                  <label className="label" htmlFor="end_time">End Time</label>
                  <input id="end_time" type="time" className="input" {...register('end_time')} />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                className="input"
                rows={3}
                placeholder="Internal notes (optional)"
                style={{ resize: 'vertical' }}
                {...register('notes')}
              />
            </div>

            {submitError && (
              <div style={{
                padding: '12px 14px', borderRadius: 8,
                background: 'var(--danger-bg)', color: 'var(--danger)',
                fontSize: 13,
              }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              {!isEdit && (
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Activity'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
