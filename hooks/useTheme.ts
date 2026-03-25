'use client'

import { useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'theme'
const THEME_CHANGE_EVENT = 'theme-change'

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemChange = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      onStoreChange()
    }
  }
  const onStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange()
    }
  }
  const onThemeChange = () => onStoreChange()

  mq.addEventListener('change', onSystemChange)
  window.addEventListener('storage', onStorageChange)
  window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)

  return () => {
    mq.removeEventListener('change', onSystemChange)
    window.removeEventListener('storage', onStorageChange)
    window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
  }
}

function notifyThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, getPreferredTheme, () => 'light')

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
    notifyThemeChange()
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    const sys: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    applyTheme(sys)
    notifyThemeChange()
  }

  return { theme, toggle, reset }
}
