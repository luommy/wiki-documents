---
id: verified-apps
title: NE503 Verified Apps
sidebar_position: 4
description: NE503 verified application use cases, covering person detection, occupancy monitoring, safety helmet compliance detection and more, with effect previews, verification details, and app package download links (app.yaml + image.tar) to help users preview results and get deployment packages in one step.
keywords: [NE503, App Use Cases, Verified Apps, Person Detection, Occupancy Monitor, Safety Helmet, Container App, Edge AI, App Download]
tags: [NE503, App Deployment, Container App, Person Detection, Occupancy Monitor, Safety Helmet, Edge AI]
---

# NE503 Verified Apps

The apps below have all been verified on real NE503 hardware. Download and install them directly for testing, or use the source code as a reference for your own development to accelerate POC delivery.

If you need a ready-made model, start with the [CamThink Model Zoo](https://www.camthink.ai/developer-center/models/). The Model Zoo provides downloadable model files that you can use to build your own app; this page provides complete app packages that have already been verified.

## App List


| App | Scenario | Inference Model | Preview | Verification Result | Download |
|:-----|:-----|:--------:|:-------:|:-------:|:------:|
| Person Detection | Perimeter intrusion / area intrusion detection | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Person Detection: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-01-apps-running.png" alt="Person Detection: running status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-03-statistics.png" alt="Person Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Continuously detected 3 persons · 4.26M+ frames · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Occupancy Monitor | Area people counting + occupancy monitoring | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Occupancy Monitor: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-app-status.png" alt="Occupancy Monitor: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-detection-result.png" alt="Occupancy Monitor: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Occupancy rate published periodically · frames 50→550 · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Safety Helmet Detection | Construction safety PPE compliance — helmet / no-helmet detection with real-time alerts | safety_helmet_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/ne503-dashboard.jpeg" alt="Safety Helmet Detection: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/sh-detection-detail.png" alt="Safety Helmet Detection: live detection" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/sh-app-running.png" alt="Safety Helmet Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Live detection of 9 persons (6 helmet + 3 no-helmet) · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/safety-helmet-detection/safety-helmet-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/safety-helmet-detection/safety-helmet-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |

---

## Deployment

After downloading the app's `app.yaml` and `image.tar`, deploy via the Web Console:

Open Web Console → **App Management** → **Import** → **Upload Package**, upload `app.yaml` and `image.tar` separately, then click **Install**. After installation, click **Start** to launch the app.

![Deploy app: upload app.yaml and image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-app.png)

:::note Model preloading required
Each app depends on a different inference model. Before first use, load the corresponding model in **Model Management** on the Web Console:

- **Person Detection / Occupancy Monitor**: depend on the preinstalled `hailo_yolov8n_384_640` — just scan and load it.
- **Safety Helmet Detection**: depends on a custom-trained `safety_helmet_yolov8n_384_640` (2-class Helmet / No Helmet; the app package does not include the model). Import the corresponding `.hef` into **Model Management** and load it; the HEF can be obtained from the download link above or compiled from the app source.

![Model preload: scan and load model](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-model.png)
:::

> More app use cases are being adapted. For custom app development, see the [SDK Workflow](./1-app-development/0-sdk-workflow.md).

---

**Document Version**: v1.3 · **Last Updated**: 2026-07-21
