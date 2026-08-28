import type { User } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

import { firestore } from './firebase'

function detectPreferredLocale(): 'en' | 'vi' {
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

export async function ensureUserProfile(user: User): Promise<void> {
  await setDoc(
    doc(firestore, 'users', user.uid),
    {
      displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
      preferredLocale: detectPreferredLocale(),
      theme: 'system',
      createdAt: serverTimestamp()
    },
    { merge: true }
  )
}
