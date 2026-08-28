import type { DocumentData, QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'

import type { Note } from '@/types/base-note'

import { firestore } from './firebase'

function userCollection(uid: string, collectionName: string) {
  return collection(firestore, 'users', uid, collectionName)
}

function mapNote<T extends object>(snapshot: QueryDocumentSnapshot<DocumentData>): Note<T> {
  const data = snapshot.data() as T & Record<string, unknown>
  const createdAt = data.createdAt as { toMillis?: () => number } | undefined
  return {
    ...data,
    id: snapshot.id,
    createdAt: typeof createdAt?.toMillis === 'function' ? createdAt.toMillis() : null
  }
}

function sortByNewestFirst<T>(a: Note<T>, b: Note<T>): number {
  return (b.createdAt ?? 0) - (a.createdAt ?? 0)
}

export async function createNote<T extends object>(uid: string, collectionName: string, data: T): Promise<string> {
  const reference = await addDoc(userCollection(uid, collectionName), {
    ...data,
    createdAt: serverTimestamp()
  })
  return reference.id
}

export async function updateNote(
  uid: string,
  collectionName: string,
  noteId: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(firestore, 'users', uid, collectionName, noteId), data)
}

export async function deleteNote(uid: string, collectionName: string, noteId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'users', uid, collectionName, noteId))
}

export function subscribeToNotes<T extends object>(
  uid: string,
  collectionName: string,
  onData: (notes: Note<T>[]) => void
): Unsubscribe {
  return onSnapshot(userCollection(uid, collectionName), (snapshot) => {
    onData(snapshot.docs.map((item) => mapNote<T>(item)).sort(sortByNewestFirst))
  })
}
