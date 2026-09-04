export type ActivityType =
  | 'offsite_training'
  | 'certification'
  | 'vendor_meeting'
  | 'customer_meeting'
  | 'vendor_event'

export type WhereaboutStatus = 'upcoming' | 'ongoing' | 'completed'

export type StaffRole = 'Admin' | 'User'

export interface Staff {
  id: string
  staff_id: string
  staff_name: string
  department: string | null
  email: string | null
  access_id: string | null
  role: StaffRole
  is_active: boolean
  created_at: string
}

export interface Whereabout {
  id: string
  staff_id: string
  activity_type: ActivityType
  location: string
  description: string | null
  is_all_day: boolean
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  notes: string | null
  logged_by: string | null
  created_at: string
  updated_at: string
  staff?: Staff
}

export interface WhereaboutInsert {
  staff_id: string
  activity_type: ActivityType
  location: string
  description?: string
  is_all_day: boolean
  start_date: string
  end_date: string
  start_time?: string | null
  end_time?: string | null
  notes?: string
  logged_by?: string
}
