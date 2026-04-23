import { cookies } from 'next/headers'
import { translations, type Lang } from './translations'

type T = (typeof translations)[Lang]

export function getServerTranslations(): T {
  const lang = (cookies().get('lang')?.value ?? 'de') as Lang
  return translations[lang === 'en' ? 'en' : 'de']
}

export function getServerLang(): Lang {
  return (cookies().get('lang')?.value ?? 'de') as Lang
}
