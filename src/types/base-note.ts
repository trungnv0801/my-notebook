export interface BaseNote {
  id: string
  createdAt: number | null
}

export type Note<T> = T & BaseNote
