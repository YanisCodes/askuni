import { useState, useCallback } from 'react'

const PREFS_KEY = 'askuni_prefs'
const DEFAULTS = {
  defaultCamOn: true,
  defaultMicOn: true,
}

export function getPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

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
