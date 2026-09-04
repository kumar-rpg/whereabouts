const SESSION_KEY = 'sw-session'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours

export interface AuthSession {
  staff_id: string
  staff_name: string
  access_id: string
  expires_at: number
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: AuthSession = JSON.parse(raw)
    if (Date.now() > session.expires_at) {
      clearSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function setSession(staff: Pick<AuthSession, 'staff_id' | 'staff_name' | 'access_id'>) {
  const session: AuthSession = { ...staff, expires_at: Date.now() + SESSION_TTL }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}
