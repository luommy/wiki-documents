// Umami event tracking with pre-load queue.
// window.umami isn't available until the async script finishes loading.
// Events fired before then (e.g., 404_view on direct entry) are queued
// and flushed by injectUmami()'s s.onload callback (see Root.js).
let queue = [];

export function flushQueue() {
  if (typeof window === 'undefined' || !window.umami) return;
  queue.forEach(({ eventName, props }) => {
    window.umami.track(eventName, props);
  });
  queue = [];
}

export function track(eventName, props) {
  if (typeof window === 'undefined') return;
  if (window.umami) {
    window.umami.track(eventName, props);
  } else {
    queue.push({ eventName, props });
  }
}
