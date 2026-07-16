// consent 状态：默认 opt-in（当前无横幅，直接采）。
// 未来加横幅时：把 DEFAULT 改为 null（未决定），加横幅 UI 调 setConsent。
const STORAGE_KEY = 'wiki-analytics-consent';
const DEFAULT = 'accepted'; // 'accepted' | 'rejected' | null

export function getConsent() {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT;
  } catch {
    return DEFAULT; // 隐私模式（Safari Private Browsing 等）localStorage 不可用
  }
}

export function setConsent(value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 隐私模式写入失败 —— 仅当前会话生效
  }
  window.dispatchEvent(new CustomEvent('consent-change', { detail: value }));
}

export function hasConsent() {
  return getConsent() === 'accepted';
}
