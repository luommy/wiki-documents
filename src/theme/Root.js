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
    capture_pageview: false,            // 关自动 pageview（手动 useEffect 捕获，避免双计）
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
      // --- B4 download：外链子集（特定后缀），附加捕获（不 short-circuit，
      // 让 external_link_click 与 download 同时记录 —— 二者维度不同，spec §11 允许）。
      if (/\.(pdf|zip|bin|hex|tar\.gz|dmg|exe)$/i.test(url.pathname)) {
        posthog.capture('download', {
          file: url.pathname.split('/').pop(),
          doc_path: window.location.pathname,
        });
      }
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

  // --- B4 scroll_depth：滚动到 25/50/75/100% 各报一次，换页重置 lastDepth。
  // 使用 ref 保存 lastDepth；换页时由下方 location-keyed useEffect 重置为 0。
  // 滚动监听独立 useEffect（空依赖 —— 一次性挂载），cleanup 必须 removeEventListener。
  const lastDepthRef = React.useRef(0);
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docH =
        document.documentElement.scrollHeight - window.innerHeight;
      const depth = docH > 0 ? Math.round((scrollTop / docH) * 100) : 100;
      const marks = [25, 50, 75, 100];
      const hit = marks.find((m) => depth >= m && lastDepthRef.current < m);
      if (hit !== undefined) {
        lastDepthRef.current = hit;
        posthog.capture('scroll_depth', {
          depth: hit,
          doc_path: window.location.pathname,
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // location 变化时重置 lastDepth（否则换页后不再报 25/50/75/100）。
  React.useEffect(() => {
    lastDepthRef.current = 0;
  }, [location]);

  // --- B4 language_switch：locale 前缀变化检测。
  // Docusaurus 默认 locale（en）无 URL 前缀；非默认（zh-Hans）以 /zh-Hans/ 前缀。
  // 用已知 locale 列表做显式判断，避免把 /docs 误判为 locale。
  const KNOWN_LOCALES = ['zh-Hans', 'en'];
  const lastLocaleRef = React.useRef(null);
  React.useEffect(() => {
    if (!isProd || typeof window === 'undefined') return;
    const seg = window.location.pathname.split('/')[1];
    const cur = KNOWN_LOCALES.includes(seg) ? seg : 'en';
    if (lastLocaleRef.current && lastLocaleRef.current !== cur) {
      posthog.capture('language_switch', {
        from: lastLocaleRef.current,
        to: cur,
      });
    }
    lastLocaleRef.current = cur;
  }, [location]);

  return <>{children}</>;
}
