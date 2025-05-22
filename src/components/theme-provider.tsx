"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const root = window.document.documentElement
    const savedTheme = localStorage.getItem(storageKey)

    if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
      setTheme(savedTheme as Theme)
    } else if (defaultTheme) {
      setTheme(defaultTheme)
      localStorage.setItem(storageKey, defaultTheme)
    }
  }, [defaultTheme, storageKey])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")

    if (disableTransitionOnChange) {
      root.classList.add("no-transition")
    }

    if (theme === "system") {
      if (prefersDark.matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    } else if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    }

    if (mounted) {
      localStorage.setItem(storageKey, theme)
    }

    const cleanupTransition = () => {
      root.classList.remove("no-transition")
    }

    if (disableTransitionOnChange) {
      setTimeout(cleanupTransition, 0)
    }

    return () => {
      if (disableTransitionOnChange) {
        root.classList.remove("no-transition")
      }
    }
  }, [theme, disableTransitionOnChange, storageKey, mounted])

  useEffect(() => {
    if (!mounted || !enableSystem) return

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement
        if (prefersDark.matches) {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
      }
    }

    prefersDark.addEventListener("change", handleChange)
    return () => prefersDark.removeEventListener("change", handleChange)
  }, [theme, enableSystem, mounted])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
} 