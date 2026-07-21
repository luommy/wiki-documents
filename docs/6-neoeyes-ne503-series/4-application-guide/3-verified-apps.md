---
id: verified-apps
title: NE503 Verified Apps
sidebar_position: 3
description: NE503 已验证应用用例，涵盖人员检测、占用率统计、安全帽合规检测等场景，包含效果预览图、验证详情和应用包下载链接（app.yaml + image.tar），帮助用户快速阅览效果并一键获取部署包。
keywords: [NE503, 应用用例, Verified Apps, Person Detection, Occupancy Monitor, Safety Helmet, 安全帽检测, 容器应用, 边缘AI, 应用下载]
tags: [NE503, 应用部署, 容器应用, Person Detection, 占用率监测, Safety Helmet, 边缘AI]
---

# NE503 Verified Apps

以下应用均已在 NE503 实机验证通过，可直接下载安装到设备测试，也可参考源码二次开发，加速 POC 落地。

## 应用列表


| 应用 | 场景 | 推理模型 | 效果预览 | 验证结果 | 下载文件 |
|:-----|:-----|:--------:|:-------:|:-------:|:------:|
| Person Detection | 周界入侵 / 区域入侵检测 | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Person Detection: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-01-apps-running.png" alt="Person Detection: running status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-03-statistics.png" alt="Person Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | 持续检测到 3 人 · 推理帧数 426 万+ · <span style={{color:'#4caf50'}}>✅ 通过</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/person-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Occupancy Monitor | 区域人数统计 + 占用率监测 | hailo_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/pd-verify-04-detail.png" alt="Occupancy Monitor: app detail" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-app-status.png" alt="Occupancy Monitor: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/occupancy-detection-result.png" alt="Occupancy Monitor: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | 占用率周期发布正常 · 帧数 50→550 · <span style={{color:'#4caf50'}}>✅ 通过</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/occupancy-monitor/occupancy-monitor.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |
| Safety Helmet Detection | 安全生产合规检测（识别戴/未戴安全帽的人员，未戴实时告警） | safety_helmet_yolov8n_384_640 | <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/ne503-dashboard.jpeg" alt="Safety Helmet Detection: app status" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/sh-detection-detail.png" alt="Safety Helmet Detection: live detection" style={{width:'110px',borderRadius:'6px'}} /><img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/sh-app-running.png" alt="Safety Helmet Detection: detection result" style={{width:'110px',borderRadius:'6px'}} /></div> | 实时检测 9 人（6 戴帽 + 3 未戴） · <span style={{color:'#4caf50'}}>✅ 通过</span> | <a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/safety-helmet-detection/safety-helmet-detection.yaml" download style={{background:'#f3e5f5',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>app.yaml</a><br/><a href="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/safety-helmet-detection/safety-helmet-detection.tar" download style={{background:'#e3f2fd',padding:'2px 8px',borderRadius:'4px',fontSize:'0.8em',textDecoration:'none',margin:'2px',display:'inline-block'}}>image.tar</a> |

---

## 部署方法

下载应用的 `app.yaml` 和 `image.tar` 后，通过 Web 控制台完成部署：

打开 Web 控制台 → **App Management** → **Import** → **Upload Package**，分别上传 `app.yaml` 和 `image.tar`，点击 **Install**。安装完成后点击 **Start** 启动应用。

![部署应用：上传 app.yaml 和 image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-app.png)

:::note 模型需预加载
各应用依赖的推理模型不同，首次使用前需在 Web 控制台 **Model Management** 中加载对应模型：

- **Person Detection / Occupancy Monitor**：依赖出厂预装的 `hailo_yolov8n_384_640`，扫描并加载即可。
- **Safety Helmet Detection**：依赖自训的 `safety_helmet_yolov8n_384_640`（2 类 Helmet / No Helmet，app 包不含模型）。需在 **Model Management** 导入对应的 `.hef` 后加载；该 HEF 可从上方的下载链接获取，或参考应用源码自行编译。

![模型预加载：扫描并加载模型](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/verified-apps/upload-model.png)
:::

> 更多应用用例正在适配中，自定义应用开发请参考 [应用开发指南](/docs/neoeyes-ne503-series/application-guide/app-development/sdk-workflow)。

---

**文档版本**：v1.3 · **最后更新**：2026-07-21
