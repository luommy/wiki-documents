// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/* -------------------------------------------------- */
/* 1️⃣  环境检测 / 动态变量                             */
/* -------------------------------------------------- */
const IS_GITHUB = process.env.GITHUB_ACTIONS === 'true';
const IS_GITHUB_ENV = process.env.DEPLOY_ENV === 'github';
const BASE_URL = process.env.BASE_URL  // 手动覆盖优先
  ?? (IS_GITHUB && IS_GITHUB_ENV ? '/wiki-documents/' : '/');

const SITE_URL = process.env.SITE_URL  // 手动覆盖优先
  ?? (IS_GITHUB && IS_GITHUB_ENV ? 'https://camthink-ai.github.io' : 'https://wiki.camthink.ai');
console.log('BASE_URL---------', BASE_URL);
console.log('SITE_URL---------', SITE_URL);

/** @type {import('@docusaurus/types').Config} */
const SHOULD_ENABLE_GTAG = process.env.NODE_ENV === 'production';

const configuredPlugins = [
  'docusaurus-plugin-image-zoom',
  [
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
      language: ['en', 'zh'],
      highlightSearchTermsOnTargetPage: true,
      explicitSearchResultPath: true,
      docsRouteBasePath: '/',
      indexDocs: true,
      indexBlog: false,
      docsDir: 'docs',
    },
  ],
  ['@docusaurus/plugin-client-redirects',
    {
      redirects: [
        {
          from: '/',
          to: '/docs',
        },
      ],
    }
  ],
];

if (SHOULD_ENABLE_GTAG) {
  configuredPlugins.push([
    '@docusaurus/plugin-google-gtag',
    {
      trackingID: 'G-8XB41LWC1W',
      anonymizeIP: true,
    },
  ]);
}

const config = {
  /* -------------------------------------------------- */
  /* 2️⃣  站点信息                                       */
  /* -------------------------------------------------- */
  title: 'CamThink',
  tagline:
    'Through detailed documentation, practical tutorials, and active community support, we help developers leverage open hardware for AI project development and innovation.',
  favicon: 'img/favicon.ico',

  /* GitHub / Cloudflare 共用（由上方动态注入） */
  url: SITE_URL,
  baseUrl: BASE_URL,


  /* GitHub Pages 部署 (org/user & repo) — 不在 GitHub 可忽略 */
  organizationName: 'camthink-ai',
  projectName: 'wiki-documents',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  /* -------------------------------------------------- */
  /* 3️⃣  国际化                                         */
  /* -------------------------------------------------- */
  i18n: {
    defaultLocale: 'en',
    locales: ['zh-Hans', 'en'],
    localeConfigs: {
      'zh-Hans': { htmlLang: 'zh-Hans', label: '中文' },
      en: { htmlLang: 'en-US', label: 'English' },
    },
  },

  /* -------------------------------------------------- */
  /* 4️⃣  插件 / 主题                                     */
  /* -------------------------------------------------- */
  plugins: configuredPlugins,
  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: undefined,  // 关闭 “编辑此页”
          routeBasePath: '/docs',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],

  /* -------------------------------------------------- */
  /* 5️⃣  主题配置 (Navbar / Footer / Prism …)           */
  /* -------------------------------------------------- */
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/Camthink-logo.png',
      navbar: {
        title: '',
        logo: {
          alt: 'CamThink',
          src: 'img/logo.svg',
          srcDark: 'img/logo_dark.svg',
          href: '/docs',
        },
        items: [
          {
            href: 'https://www.camthink.ai/?utm_source=wiki&utm_medium=internal_nav&utm_campaign=wiki_to_site',
            position: 'right',
            label: '🏠 Home',
            className: 'home-button'
          },
          {
            href: 'https://www.camthink.ai/store/?utm_source=wiki&utm_medium=internal_nav&utm_campaign=wiki_to_store',
            position: 'right',
            label: '🛍️ Store',
            className: 'store-button'
          },
          { href: 'https://github.com/camthink-ai', position: 'right', label: 'GitHub' },
          { type: 'localeDropdown', position: 'right' },
        ],
      },
      zoom: {
        selector: '.markdown img:not(.no-zoom), article img:not(.no-zoom), .theme-doc-markdown img:not(.no-zoom)',
        background: { light: 'rgba(255, 255, 255, 0.9)', dark: 'rgba(0, 0, 0, 0.8)' },
        config: { margin: 24, scrollOffset: 0 },
      },
      mermaid: { theme: { light: 'neutral', dark: 'forest' } },
      colorMode: { defaultMode: 'light', disableSwitch: false, respectPrefersColorScheme: true },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Wiki', items: [
              { label: 'Home', to: '/docs' },
              { label: 'NG4500', to: '/docs/neoedge-ng4500-series/overview' },
              { label: 'NE101', to: '/docs/neoeyes-ne101-series/overview' },
            ]
          },
          {
            title: 'Community', items: [
              { label: 'Discord', href: 'https://discord.com/invite/6TZb2Y8WKx' },
              { label: 'X', href: 'https://x.com/CamThinkAI' },
              { label: 'Youtube', href: 'https://www.youtube.com/@CamThink' },
            ],
          },
          {
            title: 'More', items: [
              { label: 'WebSite', href: 'https://www.camthink.ai' },
              { label: 'Store', href: 'https://www.camthink.ai/store/' },
              { label: 'GitHub', href: 'https://github.com/camthink-ai' }
            ]
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CamThink.ai All rights reserved.`,
      },
      prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
      announcementBar: {
        id: 'support_us',
        content: `
          <div class="announcement-bar">
            <div class="announcement-content">
              <div class="announcement-carousel">
                <div class="announcement-track">
                  <div class="announcement-text">
                    <b>
                      <a
                        href="https://www.camthink.ai/store"
                        target="_blank"
                        class="announcement-link"
                      >
                        🎄Christmas Gift | Free Shipping Over $300
                      </a>
                    </b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        textColor: '#091E42',
        isCloseable: false,
      },
    }),
};

export default config;
