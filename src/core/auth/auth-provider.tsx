import { createContext, type ReactNode, useEffect, useState } from 'react'

import type { User } from 'firebase/auth'
import {
  confirmPasswordReset,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  verifyPasswordResetCode
} from 'firebase/auth'

import { firebaseAuth } from '@/core/firebase/firebase'
import type { AppUser } from '@/types/user'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyResetCode: (code: string) => Promise<string>
  confirmResetPassword: (code: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        setUser(firebaseUser ? toAppUser(firebaseUser) : null)
        setLoading(false)
      }),
    []
  )

  async function signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password)
  }

  async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(firebaseAuth, email)
  }

  async function verifyResetCode(code: string): Promise<string> {
    return verifyPasswordResetCode(firebaseAuth, code)
  }

  async function confirmResetPassword(code: string, password: string): Promise<void> {
    await confirmPasswordReset(firebaseAuth, code, password)
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(firebaseAuth)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, resetPassword, verifyResetCode, confirmResetPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
