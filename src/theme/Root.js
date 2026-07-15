import React from 'react';
import { useLocation } from '@docusaurus/router';
import posthog from 'posthog-js';
import { hasConsent } from '../analytics/posthog-consent';

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

  // --- B3：核心事件埋点（external_link_click / code_copy / search）---
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;

    // 处理器 1：external_link_click —— 捕获阶段监听站外 <a> 点击
    const onExternalLinkClick = (e) => {
      const a = e.target.closest('a[href^="http"]');
      if (!a) return;
      let url;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      // 排除自身采集域名
      if (url.hostname === 'wiki-data.camthink.ai') return;
      posthog.capture('external_link_click', {
        url: a.href,
        text: (a.textContent || '').trim().slice(0, 80),
        location: a.closest('header, footer, nav') ? 'navbar/footer' : 'content',
      });
    };

    // 处理器 2：code_copy —— 点击代码块复制按钮。
    // DOM 结构（已核实 theme-classic 3.6.1 源码）：
    //   .theme-code-block > .codeBlockContent > pre + .buttonGroup > button.clean-btn
    // 复制按钮是 <pre> 的兄弟节点（非子节点），故用 .theme-code-block
    // （ThemeClassNames.common.codeBlock 的非 hash 全局类）定位代码块容器。
    const onCodeCopyClick = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const codeBlock = btn.closest('.theme-code-block');
      if (!codeBlock) return; // 不在代码块内
      const buttonGroup = btn.parentElement;
      const isCopyButton =
        buttonGroup?.previousElementSibling?.matches('pre') &&
        btn === buttonGroup.lastElementChild;
      if (!isCopyButton) return;
      const langMatch = codeBlock.className.match(/language-([\w-]+)/);
      posthog.capture('code_copy', {
        code_language: langMatch ? langMatch[1] : 'unknown',
        doc_path: window.location.pathname,
      });
    };

    // 处理器 3：search —— 在搜索输入框中按回车键。
    // 注意：@easyops-cn/docusaurus-search-local 异步渲染结果，
    // 因此 results_count 可能为 0；query 本身可靠。
    const onSearchKey = (e) => {
      if (e.key !== 'Enter') return;
      const input = e.target.closest(
        'input[class*="search" i], input[aria-label*="search" i]',
      );
      if (!input) return;
      posthog.capture('search', {
        query: (input.value || '').trim().slice(0, 100),
        results_count: document.querySelectorAll(
          '[class*="search-result-item" i]',
        ).length,
      });
    };

    document.addEventListener('click', onExternalLinkClick, true);
    document.addEventListener('click', onCodeCopyClick, true);
    document.addEventListener('keydown', onSearchKey, true);

    return () => {
      document.removeEventListener('click', onExternalLinkClick, true);
      document.removeEventListener('click', onCodeCopyClick, true);
      document.removeEventListener('keydown', onSearchKey, true);
    };
  }, []);

  return <>{children}</>;
}
