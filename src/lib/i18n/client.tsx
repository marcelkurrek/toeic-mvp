'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

type T = (typeof translations)[Lang]

interface LangContextValue {
  lang: Lang
  t: T
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'de',
  t: translations.de as T,
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de')

  useEffect(() => {
    const stored = (document.cookie.match(/(?:^|; )lang=([^;]*)/) ?? [])[1] as Lang | undefined
    if (stored === 'de' || stored === 'en') setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`
    setLangState(l)
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
