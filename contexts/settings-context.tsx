'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SettingsContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  notifications: boolean
  setNotifications: (enabled: boolean) => void
  studyReminders: boolean
  setStudyReminders: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [notifications, setNotifications] = useState(true)
  const [studyReminders, setStudyReminders] = useState(true)

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    const savedNotifications = localStorage.getItem('notifications')
    const savedStudyReminders = localStorage.getItem('studyReminders')

    if (savedTheme) setTheme(savedTheme)
    if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications))
    if (savedStudyReminders !== null) setStudyReminders(JSON.parse(savedStudyReminders))
  }, [])

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Save notification settings to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    // Save study reminder settings to localStorage
    localStorage.setItem('studyReminders', JSON.stringify(studyReminders))
  }, [studyReminders])

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        notifications,
        setNotifications,
        studyReminders,
        setStudyReminders,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
