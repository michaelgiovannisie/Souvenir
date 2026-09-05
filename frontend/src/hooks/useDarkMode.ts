import { useEffect, useState } from 'react'

const STORAGE_KEY = 'souvenir-theme'

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Run before first render to avoid flash
applyTheme(getInitial())

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(getInitial)

  useEffect(() => {
    applyTheme(isDark)
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    } catch {}
  }, [isDark])

  const toggle = () => setIsDark((v) => !v)

  return { isDark, toggle }
}
