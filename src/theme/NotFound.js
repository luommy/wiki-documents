// B4 404_view：访问不存在页面时上报。主题 shadowing（手动创建，未跑 swizzle）。
// 关键：必须 wrap @theme-original/NotFound —— 原 NotFound 承载 404 页面 UI，不能丢。
import React from 'react';
import NotFound from '@theme-original/NotFound';
import { track } from '../analytics/track';

export default function NotFoundWrapper(props) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      track('404_view', {
        path: window.location.pathname,
        referrer: document.referrer,
      });
    }
  }, []);
  return <NotFound {...props} />;
}
