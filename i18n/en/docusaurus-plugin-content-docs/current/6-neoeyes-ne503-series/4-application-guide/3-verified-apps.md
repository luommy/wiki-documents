---
id: verified-apps
title: NE503 Verified Apps
sidebar_position: 3
description: NE503 verified application use cases, covering person detection, occupancy monitoring, lingering detection and more, with effect previews, verification details, and app package download links (app.yaml + image.tar) to help users preview results and get deployment packages in one step.
keywords: [NE503, App Use Cases, Verified Apps, Person Detection, Occupancy Monitor, Container App, Edge AI, App Download]
tags: [NE503, App Deployment, Container App, Person Detection, Occupancy Monitor, Edge AI]
---

# NE503 Verified Apps

The apps below have all been verified on real NE503 hardware. Download and install them directly for testing, or use the source code as a reference for your own development to accelerate POC delivery.

## App List


| App | Scenario | Inference Model | Preview | Verification Result | Download |
|:-----|:-----|:--------:|:-------:|:-------:|:------:|
| Person Detection | Perimeter intrusion / area intrusion detection | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Person Detection: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-01-apps-running.png" alt="Person Detection: running status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-03-statistics.png" alt="Person Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Continuously detected 3 persons · 4.26M+ frames · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Occupancy Monitor | Area people counting + occupancy monitoring | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Occupancy Monitor: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-app-status.png" alt="Occupancy Monitor: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-detection-result.png" alt="Occupancy Monitor: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | Occupancy rate published periodically · frames 50→550 · <span style={{color:'#4caf50'}}>✅ Passed</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |

---

## Deployment

After downloading the app's `app.yaml` and `image.tar`, deploy via the Web Console:

Open Web Console → **App Management** → **Import** → **Upload Package**, upload `app.yaml` and `image.tar` separately, then click **Install**. After installation, click **Start** to launch the app.

![Deploy app: upload app.yaml and image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-app.png)

:::note Model preloading required
The apps above all depend on the `hailo_yolov8n_384_640` model. Before first use, scan and load the model in **Model Management** on the Web Console:

![Model preload: scan and load model](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-model.png)
:::

> More app use cases are being adapted. For custom app development, see the [App Development Guide](/docs/neoeyes-ne503-series/application-guide/app-development/sdk-workflow).

---

**Document Version**: v1.2 · **Last Updated**: 2026-07-16
