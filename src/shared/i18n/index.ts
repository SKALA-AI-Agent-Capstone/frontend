/**
 * 화면 문구 번역. 문구는 src/locales/<언어>/<화면>.json에 따로 두고, 파일 이름이 키의 첫 마디가 된다.
 * 예: src/locales/en/dashboard.json의 "title" → t('dashboard.title')
 * 서버가 주는 내용(AI 결과, 법령 원문, 오류 메시지)은 번역하지 않는다.
 */
import { createI18n } from 'vue-i18n'

export const LOCALES = ['ko', 'en'] as const
export type Locale = (typeof LOCALES)[number]

const STORAGE_KEY = 'beauty-review:locale'

const koFiles = import.meta.glob('../../locales/ko/*.json', { eager: true, import: 'default' })
const enFiles = import.meta.glob('../../locales/en/*.json', { eager: true, import: 'default' })

function bundle(files: Record<string, unknown>) {
  const messages: Record<string, unknown> = {}
  for (const [path, content] of Object.entries(files)) {
    messages[path.split('/').pop()!.replace(/\.json$/, '')] = content
  }
  return messages
}

function savedLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale
  } catch { /* 저장소를 못 쓰면 기본 언어 */ }
  return 'ko'
}

const initial = savedLocale()
document.documentElement.lang = initial

export const i18n = createI18n({
  legacy: false,
  locale: initial,
  fallbackLocale: 'ko',
  messages: { ko: bundle(koFiles), en: bundle(enFiles) } as never,
  missingWarn: false,
  fallbackWarn: false,
})

/** 컴포넌트 밖(상수, 스토어, 라우터)에서 쓰는 번역 함수. 언어가 바뀌면 화면이 다시 그려진다. */
// 메시지 타입을 추론하면 타입 검사가 너무 깊어지므로 필요한 모양만 꺼내 쓴다
type Translate = (key: string, params?: Record<string, unknown>) => string
const composer = i18n.global as unknown as { t: Translate; locale: { value: string } }

export function t(key: string, params?: Record<string, unknown>): string {
  return params ? composer.t(key, params) : composer.t(key)
}

export function currentLocale(): Locale {
  return composer.locale.value as Locale
}

export function setLocale(locale: Locale) {
  composer.locale.value = locale
  document.documentElement.lang = locale
  try { localStorage.setItem(STORAGE_KEY, locale) } catch { /* 저장 실패해도 화면 언어는 바뀐다 */ }
}

/**
 * 상수 객체의 문구 속성을 번역 키로 바꾼다. 속성을 읽을 때마다 현재 언어로 번역되어 화면이 언어를 따라간다.
 * 예: translated({ variant: 'info' }, { label: 'review.status.queued' })
 */
export function translated<T extends object, K extends string>(base: T, keys: Record<K, string>): Readonly<T & Record<K, string>> {
  // 값 대신 속성 정의를 복사해 base에 둔 getter도 그대로 살린다
  const target = Object.defineProperties({}, Object.getOwnPropertyDescriptors(base)) as T & Record<K, string>
  for (const [prop, key] of Object.entries(keys) as [string, string][]) {
    Object.defineProperty(target, prop, { get: () => t(key), enumerable: true })
  }
  return Object.freeze(target)
}

/** { 값: 번역 키 } 모양의 표를 { 값: 현재 언어 문구 } 로 읽히게 만든다. */
export function textMap<K extends string>(keys: Record<K, string>): Readonly<Record<K, string>> {
  return translated({}, keys)
}
