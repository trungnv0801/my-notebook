import { useCallback, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value)
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // storage full or unavailable — keep in-memory value only
      }
    },
    [key]
  )

  return [storedValue, setValue]
}
