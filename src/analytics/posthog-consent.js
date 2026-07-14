// consent 状态：默认 opt-in（当前无横幅，直接采）。
// 未来加横幅时：把 DEFAULT 改为 null（未决定），加横幅 UI 调 setConsent。
const STORAGE_KEY = 'wiki-analytics-consent';
const DEFAULT = 'accepted'; // 'accepted' | 'rejected' | null

export function getConsent() {
  if (typeof window === 'undefined') return DEFAULT;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT;
}

export function setConsent(value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent('consent-change', { detail: value }));
}

export function hasConsent() {
  return getConsent() === 'accepted';
}
