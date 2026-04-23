type ErrorTranslations = {
  emailRateLimit: string
  emailAlreadyRegistered: string
  emailNotConfirmed: string
  invalidCredentials: string
  weakPassword: string
  generic: string
}

export function translateAuthError(msg: string, e: ErrorTranslations): string {
  const m = msg.toLowerCase()
  if (m.includes('rate limit') || m.includes('too many'))  return e.emailRateLimit
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user already')) return e.emailAlreadyRegistered
  if (m.includes('not confirmed') || m.includes('email not confirmed')) return e.emailNotConfirmed
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password')) return e.invalidCredentials
  if (m.includes('password') && m.includes('6'))           return e.weakPassword
  return e.generic
}
