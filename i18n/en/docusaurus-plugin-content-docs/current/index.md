---
title: Welcome
hide_table_of_contents: true
pagination_next: null
pagination_prev: null
slug: /
---

import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import '@site/src/css/docs-home.css';

<div className="docs-home-container">

  {/* Hero Search Area */}
  <div className="docs-hero">
    <h1>CamThink Wiki Center</h1>
    <p>Explore Edge Intelligence, start here. Build your AIoT applications.</p>
  </div>

  <div className="docs-intro">
    <p><strong>Welcome to CamThink Wiki Center!</strong></p>
    <p>We are excited to have you join our community, the best place to learn about and explore Edge AI technology. Whether you are a beginner or an experienced developer, you will find useful resources and support here.</p>
    <p><strong>CamThink, Fueling Imagination to Edge Intelligence</strong></p>
    <p style={{marginBottom: '0'}}>CamThink is a brand that provides developers with a variety of **open-architecture hardware** and **open-source software**. We are committed to building an **edge AI perception suite** that can be widely used in the real world. Our focus is on providing multi-dimensional perception capabilities such as visual, audio, and environmental data, aiming to allow AI to understand the world more comprehensively and promote the popularization and development of edge intelligence technology. As a sub-brand of Milesight, CamThink inherits its strong R&D capabilities and global support network, providing a strong guarantee for product reliability and continuous innovation.</p>
  </div>
  
  <div style={{height: '3rem'}}></div>

  {/* ================= Latest Updates ================= */}
  <h2 className="docs-section-title">Latest Docs</h2>
  <div className="latest-docs-grid">
    <Link to="/docs/neoeyes-ne301-series/quick-start" className="update-card">
      <span className="update-badge">NEW</span>
      <div className="update-title">NeoEyes NE301 Quick Start</div>
      <div className="update-meta">
        <span>Doc Update</span>
        <span>• 2026-01-04</span>
      </div>
    </Link>
    <Link to="/docs/neoedge-ng4500-series/application-guide/deepseek-r1" className="update-card">
      <div className="update-title">DeepSeek R1 Local Deployment Guide</div>
      <div className="update-meta">
        <span>Hot Topic</span>
        <span>• 2025-11-09</span>
      </div>
    </Link>
    <Link to="/docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide" className="update-card">
      <div className="update-title">NG4500 Carrier Board Hardware Interface Reference</div>
      <div className="update-meta">
        <span>Hardware</span>
        <span>• 2025-09-20</span>
      </div>
    </Link>
  </div>

  {/* ================= Quick Access (Product Series) ================= */}
  <h2 className="docs-section-title">Quick Access</h2>
  <div className="doc-categories-grid">
    {/* NE301 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne301-series/overview" className="cat-header" style={{background: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)'}}>
        <img src={useBaseUrl('img/ne301/overview/301.png')} style={{height: '80px', pointerEvents: 'none'}} alt="NE301" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE301</div>
        <div className="cat-desc">STM32N6 Edge AI Camera, supporting Cortex-M55 + NPU efficient inference.</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne301-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne301-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne301-series/NE300-MB01-development-board/dev-guide" className="cat-link-item">Dev Guide</Link>
          <Link to="/docs/neoeyes-ne301-series/application-guide/model-training" className="cat-link-item">Model Training</Link>
        </div>
      </div>
    </div>

    {/* NE101 */}
    <div className="category-card">
      <Link to="/docs/neoeyes-ne101-series/overview" className="cat-header" style={{background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'}}>
        <img src={useBaseUrl('img/Overview/NE101/NE101.png')} style={{height: '80px', pointerEvents: 'none'}} alt="NE101" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEyes NE101</div>
        <div className="cat-desc">ESP32-S3 Low-Power Transmission Node, designed for battery-powered scenarios.</div>
        <div className="cat-links">
          <Link to="/docs/neoeyes-ne101-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoeyes-ne101-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoeyes-ne101-series/ne100-mb01-development-board/dev-guide" className="cat-link-item">Dev Guide</Link>
          <Link to="/docs/neoeyes-ne101-series/application-guide/low-power-image-acquisition" className="cat-link-item">Low Power App</Link>
        </div>
      </div>
    </div>

    {/* NG4500 */}
    <div className="category-card">
      <Link to="/docs/neoedge-ng4500-series/overview" className="cat-header" style={{background: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)'}}>
        <img src={useBaseUrl('img/Overview/NG45xx/NG45XX.png')} style={{height: '80px', pointerEvents: 'none'}} alt="NG4500" />
      </Link>
      <div className="cat-body">
        <div className="cat-title">NeoEdge NG4500</div>
        <div className="cat-desc">NVIDIA Jetson Edge Computing Gateway, 21~100 TOPS powerful computing.</div>
        <div className="cat-links">
          <Link to="/docs/neoedge-ng4500-series/overview" className="cat-link-item">Overview</Link>
          <Link to="/docs/neoedge-ng4500-series/quick-start" className="cat-link-item">Quick Start</Link>
          <Link to="/docs/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide" className="cat-link-item">Hardware Guide</Link>
          <Link to="/docs/neoedge-ng4500-series/application-guide/deepseek-r1" className="cat-link-item">LLM Deploy</Link>
        </div>
      </div>
    </div>
  </div>

{/*
  <h2 className="docs-section-title">Featured Videos</h2>
  <div className="videos-grid">
    <div className="video-card" onClick={() => window.open('https://resources.camthink.ai/wiki/video/HomePage/How%20to%20Flash%20Firmware%20onto%20the%20CamThink%20NeoEyes%20NE101%20Low-Power%20Camera.mp4', '_blank')}>
      <img src={useBaseUrl('img/ne301/overview/301.png')} className="video-thumb" style={{objectFit: 'contain', background: '#333'}} alt="NE301 Unboxing" />
      <div className="video-play-btn"></div>
      <div className="video-info">
        <div className="video-title">NeoEyes NE301 Unboxing & First Look</div>
        <div className="video-meta">Comprehensive showcase of hardware details and interfaces</div>
      </div>
    </div>

    <div className="video-card" onClick={() => window.open('https://www.bilibili.com/', '_blank')}>
      <img src={useBaseUrl('img/Overview/NE101/NE101.png')} className="video-thumb" style={{objectFit: 'contain', background: '#333'}} alt="NE101 Demo" />
      <div className="video-play-btn"></div>
      <div className="video-info">
        <div className="video-title">NeoEyes NE101 Low Power Capture Demo</div>
        <div className="video-meta">Millisecond wakeup and image transmission test</div>
      </div>
    </div>
  </div>
*/}

</div>
