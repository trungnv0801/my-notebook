import { createContext, type ReactNode, useEffect, useState } from 'react'

import type { User } from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth'

import { firebaseAuth } from '@/core/firebase/firebase'
import { ensureUserProfile } from '@/core/firebase/profile'
import type { AppUser } from '@/types/user'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (displayName: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
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

  async function signUp(displayName: string, email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    await updateProfile(credential.user, { displayName })
    await ensureUserProfile(credential.user)
    setUser({ ...toAppUser(credential.user), displayName })
  }

  async function signInWithGoogle(): Promise<void> {
    const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
    const { creationTime, lastSignInTime } = credential.user.metadata
    if (creationTime === lastSignInTime) {
      await ensureUserProfile(credential.user)
    }
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(firebaseAuth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}
