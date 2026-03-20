import type { FormatKey } from './pageFormats'

export function getStoredFormat(id: string): FormatKey {
  if (typeof window === 'undefined') return 'a4'
  return (localStorage.getItem(`fmt:${id}`) as FormatKey) ?? 'a4'
}

export function loadHF(id: string) {
  return {
    header: localStorage.getItem(`hf-h:${id}`) ?? '',
    footer: localStorage.getItem(`hf-f:${id}`) ?? '',
  }
}

export function replaceVars(text: string, page: number, total: number) {
  return text.replace(/\{page\}/gi, String(page)).replace(/\{total\}/gi, String(total))
}
