import React from 'react';
import { useLocation } from '@docusaurus/router';
import posthog from 'posthog-js';
import { hasConsent, getConsent } from '../analytics/posthog-consent';

const POSTHOG_KEY = 'phc_REPLACE_WITH_A3_KEY';
const POSTHOG_URL = 'https://wiki-data.camthink.ai';
const isProd = process.env.NODE_ENV === 'production';

if (isProd && typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_url: POSTHOG_URL,
    autocapture: false,                 // 关自动捕获（spec §7.1）
    disable_session_recording: true,    // 关录屏（spec §7.1）
    persistence: hasConsent() ? 'localStorage+cookie' : 'memory',
    opt_out_capturing_by_default: !hasConsent(),
    loaded: (p) => { if (hasConsent()) p.opt_in_capturing(); },
  });
  // consent 变化时切换 persistence（横幅未来接入点）
  window.addEventListener('consent-change', () => {
    if (hasConsent()) {
      posthog.set_config({ persistence: 'localStorage+cookie' });
      posthog.opt_in_capturing();
    } else {
      posthog.set_config({ persistence: 'memory' });
      posthog.opt_out_capturing();
    }
  });
}

export default function Root({ children }) {
  const location = useLocation();
  React.useEffect(() => {
    if (isProd && typeof window !== 'undefined') {
      posthog.capture('$pageview', { path: location.pathname });
    }
  }, [location]);
  return <>{children}</>;
}
