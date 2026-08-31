const authErrorKeys: Record<string, string> = {
  'auth/invalid-credential': 'invalidCredentials',
  'auth/wrong-password': 'invalidCredentials',
  'auth/user-not-found': 'userNotFound',
  'auth/weak-password': 'weakPassword',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/expired-action-code': 'resetLinkInvalid',
  'auth/invalid-action-code': 'resetLinkInvalid'
}

export function authErrorMessage(code: string): string {
  return authErrorKeys[code] ?? 'generic'
}

export function firebaseErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return ''
}
