import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, { translate } from '@docusaurus/Translate';
import ProductCarousel from '@site/src/components/ProductCarousel';
import '../css/welcome.css';

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Welcome to ${siteConfig.title}`}
            description="Edge AI Platform Wiki - Build Intelligent Devices for the Real World">

            <div className="welcome-page-container">

                {/* ================= HERO ================= */}
                <div className="hero-section hero-platform">
                    <div className="hero-bg-animation"></div>
                    <div className="hero-glow hero-glow-1"></div>
                    <div className="hero-glow hero-glow-2"></div>

                    <div className="hero-content">
                        <div className="hero-badge">🚀 Open Hardware · Edge AI · Open Source</div>

                        <h1 className="hero-title">
                            <span className="title-gradient">CamThink</span><br />
                            Edge AI Platform Wiki
                        </h1>

                        <p className="hero-subtitle">
                            Build Intelligent Devices for the Real World
                        </p>

                        <p className="hero-description">
                            <Translate id="homepage.hero.desc.p1">CamThink 是一个面向现实世界的边缘 AI 平台，</Translate><br />
                            <Translate id="homepage.hero.desc.p2">提供从</Translate> <strong><Translate id="homepage.hero.desc.bold1">开放硬件设计</Translate></strong>、<strong><Translate id="homepage.hero.desc.bold2">系统软件</Translate></strong> <Translate id="homepage.hero.desc.to">到</Translate> <strong><Translate id="homepage.hero.desc.bold3">AI 模型部署</Translate></strong> <Translate id="homepage.hero.desc.p3">的完整解决方案。</Translate>
                        </p>

                        <div className="hero-tags">
                            <span>🔧 Hardware-first</span>
                            <span>🧠 Edge Intelligence</span>
                            <span>⚡ Low Power</span>
                            <span>🔓 Fully Open</span>
                        </div>

                        <div className="hero-actions">
                            <Link to="#platform-overview" className="btn-primary">
                                <Translate id="homepage.hero.start">开始探索</Translate>
                            </Link>
                            <Link to="https://github.com/camthink-ai" className="btn-github">
                                GitHub
                            </Link>
                        </div>

                        <div className="hero-scroll-indicator" onClick={() => document.getElementById('platform-overview')?.scrollIntoView({ behavior: 'smooth' })}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Stats Section Removed */}

                {/* ================= PLATFORM OVERVIEW ================= */}
                <div className="section-container" id="platform-overview">
                    <div className="section-header">
                        <span className="section-label">PLATFORM</span>
                        <h2 className="section-title"><Translate id="homepage.platform.title">CamThink 平台能力总览</Translate></h2>
                        <p className="section-desc">
                            <Translate id="homepage.platform.desc">一个覆盖硬件、系统、AI 工具链与边缘部署的完整平台</Translate>
                        </p>
                    </div>

                    <div className="platform-grid-row-3">
                        <div className="platform-card">
                            <h3>🧩 Hardware</h3>
                            <p><Translate id="homepage.platform.card.hardware">开放原理图、PCB、模块化设计，支持快速定制、量产与批量部署。</Translate></p>
                        </div>
                        <div className="platform-card">
                            <h3>🖥 OS & BSP</h3>
                            <p><Translate id="homepage.platform.card.os">RTOS / Linux 支持，完整驱动与 Board Support Package。</Translate></p>
                        </div>
                        <div className="platform-card">
                            <h3>🧠 AI Tools</h3>
                            <p><Translate id="homepage.platform.card.tools">模型管理、调用、训练、量化、转换、部署全流程云平台支持。</Translate></p>
                        </div>
                    </div>

                    <div className="platform-grid-row-2">
                        <div className="platform-card">
                            <h3>⚡ Edge Runtime</h3>
                            <p><Translate id="homepage.platform.card.runtime">本地推理、低延迟响应、稳定运行。</Translate></p>
                        </div>
                        <div className="platform-card">
                            <h3>🌐 Connectivity</h3>
                            <p><Translate id="homepage.platform.card.connect">MQTT / HTTP等多协议支持，开放平台，支持本地与私有云部署。</Translate></p>
                        </div>
                    </div>
                </div>

                {/* ================= PRODUCTS ================= */}
                <div className="section-container" id="core-products">
                    <div className="section-header">
                        <span className="section-label">QUICK ACCESS</span>
                        <h2 className="section-title"><Translate id="homepage.products.title">快速入口</Translate></h2>
                        <p className="section-desc">
                            <Translate id="homepage.products.desc">为了帮助你快速上手 CamThink 产品，这里提供了一些重要的资源链接</Translate>
                        </p>
                    </div>

                    <ProductCarousel />
                </div>

                {/* ================= TECH STACK PANORAMA ================= */}
                <div className="tech-stack-section">
                    <div className="tech-stack-header">
                        <div className="section-label">PLATFORM PANORAMA</div>
                        <h2><Translate id="homepage.stack.title">平台技术栈全景</Translate></h2>
                        <p className="tech-stack-subtitle"><Translate id="homepage.stack.subtitle">从底层算力到上层应用，完整覆盖您的开发需求</Translate></p>
                    </div>

                    <div className="tech-stack-container">

                        {/* Layer 1: Applications */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.app">应用层</Translate></div>
                            <div className="layer-content">
                                <div className="stack-apps-grid">
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M8 21v-2a2 2 0 0 1 4 0v2" /><path d="M10 9a2 2 0 1 0 4 0" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.building">智能楼宇</Translate></span>
                                    </div>
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 2.5 2.5 0 0 0-5 0c0 1.5 1 2.5 2 4.5" /><path d="M12 21V7a2 2 0 0 1 2-2 2.5 2.5 0 0 1 0 5 2 2 0 0 0 2 2h0" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.agriculture">智慧农业</Translate></span>
                                    </div>
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.vision">视觉分析</Translate></span>
                                    </div>
                                    <div className="app-card">
                                        <span className="app-icon">
                                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                                        </span>
                                        <span><Translate id="homepage.stack.app.other">其它领域</Translate></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connector */}
                        <div className="stack-connector"></div>

                        {/* Layer 2: Middleware - ENRICHED */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.software">软件平台</Translate></div>
                            <div className="layer-content">
                                <div className="middleware-container">
                                    <div className="stack-middleware-grid">

                                        {/* Column 1: AI & Computing */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.ai">AI 推理 & 框架</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">TensorRT</span>
                                                <span className="mw-chip">DeepStream</span>
                                                <span className="mw-chip">STM32Cube.AI</span>
                                                <span className="mw-chip">ESP-DL</span>
                                                <span className="mw-chip">TFLite Micro</span>
                                                <span className="mw-chip">Ollama</span>
                                                <span className="mw-chip">VLLM</span>
                                                <span className="mw-chip">Ultralytics</span>
                                            </div>
                                        </div>

                                        {/* Column 2: OS & Core */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.os">OS & 核心组件</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">Linux / Ubuntu</span>
                                                <span className="mw-chip">FreeRTOS</span>
                                                <span className="mw-chip">JetPack SDK</span>
                                                <span className="mw-chip">Docker</span>
                                                <span className="mw-chip">OTA Update</span>
                                            </div>
                                        </div>

                                        {/* Column 3: Connectivity */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.conn">连接与协议</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">WiFi 6 / BLE</span>
                                                <span className="mw-chip">Cat.1</span>
                                                <span className="mw-chip">WiFi HaLow</span>
                                                <span className="mw-chip">MQTT</span>
                                                <span className="mw-chip">HTTP</span>
                                                <span className="mw-chip">RTSP</span>
                                                <span className="mw-chip">REST API</span>
                                            </div>
                                        </div>

                                        {/* Column 4: Tools & Extensions */}
                                        <div className="mw-column">
                                            <div className="mw-col-title"><Translate id="homepage.stack.mw.tools">工具与扩展</Translate></div>
                                            <div className="mw-chips-wrap">
                                                <span className="mw-chip">ESP-IDF</span>
                                                <span className="mw-chip">VS Code</span>
                                                <span className="mw-chip">Arduino</span>
                                                <span className="mw-chip">Camera Modules</span>
                                                <span className="mw-chip">SSD</span>
                                                <span className="mw-chip">Comm Modules</span>
                                                <span className="mw-chip">Sensors</span>
                                                <span className="mw-chip">UART/Debug</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connector */}
                        <div className="stack-connector"></div>

                        {/* Layer 3: Hardware */}
                        <div className="stack-layer">
                            <div className="layer-label"><Translate id="homepage.stack.layer.hardware">硬件生态</Translate></div>
                            <div className="layer-content">
                                <div className="stack-hw-grid">
                                    <div className="hw-stack-card hw-4500">
                                        <div className="hw-info">
                                            <div className="hw-type">High Performance Edge</div>
                                            <h3 className="hw-name">NeoEdge NG4500</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>NVIDIA Jetson</span>
                                            <span>Up to 100+ TOPS</span>
                                        </div>
                                    </div>
                                    <div className="hw-stack-card hw-301">
                                        <div className="hw-info">
                                            <div className="hw-type">Intelligent Vision</div>
                                            <h3 className="hw-name">NeoEyes NE301</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>STM32N6 (Arm Cortex-M55)</span>
                                            <span>NPU Integrated</span>
                                        </div>
                                    </div>
                                    <div className="hw-stack-card hw-101">
                                        <div className="hw-info">
                                            <div className="hw-type">Low Power IoT</div>
                                            <h3 className="hw-name">NeoEyes NE101</h3>
                                        </div>
                                        <div className="hw-chip-info">
                                            <span>ESP32-S3</span>
                                            <span>Low-frequency capture</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ================= HOW TO USE WIKI ================= */}
                <div className="cta-section">
                    <h2><Translate id="homepage.cta.title">如何使用本 Wiki</Translate></h2>
                    <div className="wiki-steps-container">
                        <div className="wiki-step-row-3">
                            <div className="wiki-step-item"><Translate id="homepage.cta.step1">明确应用需求</Translate></div>
                            <div className="wiki-step-item"><Translate id="homepage.cta.step2">选择产品系列</Translate></div>
                            <div className="wiki-step-item"><Translate id="homepage.cta.step3">完成快速入门</Translate></div>
                        </div>
                        <div className="wiki-step-row-2">
                            <div className="wiki-step-item"><Translate id="homepage.cta.step4">设备调试与应用部署</Translate></div>
                            <div className="wiki-step-item"><Translate id="homepage.cta.step5">二次开发或定制服务</Translate></div>
                        </div>
                    </div>
                </div>

                {/* ================= COMMUNITY ================= */}
                <div className="community-section">
                    <div className="community-bg-image"></div>
                    <div className="community-overlay"></div>

                    <div className="community-content">
                        <div className="section-header dark-mode-force">
                            <span className="section-label">COMMUNITY</span>
                            <h2 className="section-title"><Translate id="homepage.community.title">加入开发者社区</Translate></h2>
                            <p className="section-desc">
                                <Translate id="homepage.community.desc">与全球开发者一起探索、创造、分享</Translate>
                            </p>
                        </div>

                        <div className="community-grid">
                            <Link to="https://discord.gg/p9QSYhHJ" className="community-card">
                                <div className="community-icon">💬</div>
                                <h3>Discord Server</h3>
                                <p><Translate id="homepage.community.discord">加入实时讨论，获取技术支持</Translate></p>
                                <span className="community-link-text">Join Server &rarr;</span>
                            </Link>

                            <Link to="https://github.com/camthink-ai/community/discussions" className="community-card">
                                <div className="community-icon">
                                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                                <h3>GitHub Discussions</h3>
                                <p><Translate id="homepage.community.github">提交 Issue，参与功能提案</Translate></p>
                                <span className="community-link-text">View Discussions &rarr;</span>
                            </Link>

                            <Link to="mailto:support@camthink.ai" className="community-card">
                                <div className="community-icon">📧</div>
                                <h3>Contact Us</h3>
                                <p><Translate id="homepage.community.contact">产品咨询与商业合作</Translate></p>
                                <span className="community-link-text">Send Email &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
