import { useState, useCallback } from 'react'

const PREFS_KEY = 'askuni_prefs'
const DEFAULTS = {
  defaultCamOn: true,
  defaultMicOn: true,
}

/**
 * Reads the current user preferences from localStorage, falling back to defaults.
 * @returns {{ defaultCamOn: boolean, defaultMicOn: boolean }}
 */
export function getPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

/**
 * Reactive hook for reading and toggling user preferences persisted in localStorage.
 * @returns {{ prefs: object, togglePref: (key: string) => void }}
 */
export default function usePreferences() {
  const [prefs, setPrefs] = useState(getPrefs)

  const togglePref = useCallback((key) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { prefs, togglePref }
}
