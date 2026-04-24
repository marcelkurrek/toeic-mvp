import { cookies } from 'next/headers'
import { translations, type Lang } from './translations'

type T = (typeof translations)[Lang]

export async function getServerTranslations(): Promise<T> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('lang')?.value ?? 'de' as Lang
  return translations[lang === 'en' ? 'en' : 'de']
}

export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies()
  return (cookieStore.get('lang')?.value ?? 'de') as Lang
}
