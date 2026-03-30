---
description: 本指南介绍如何将 NeoEyes NE301 AI 智能相机的实时视频画面通过 RTMP 协议推送到后端服务器。内容涵盖使用 Nginx-RTMP 搭建接收服务器、在 NE301 Web 管理界面配置推流地址、启用视频录制，以及通过 VLC 播放器实时观看推流画面。
keywords: [NE301, RTMP, 视频推流, Nginx-RTMP, 直播, VLC, 视频录制, 边缘AI相机, 远程监控]
tags: [NE301, RTMP, 视频推流, Nginx, 远程监控]
---

# RTMP Video Streaming

NeoEyes NE301 支持通过 RTMP 协议将实时视频画面推送到后端服务器，实现远程监控、AI 推理可视化等功能。本指南以 Nginx-RTMP 为后端接收服务器，从零完成完整链路搭建。

## 1. 概览

### 为什么使用 RTMP 推流？

NE301 作为一款边缘 AI 智能相机，内置 H.264 硬件编码器，支持 1080p@30fps 视频采集。通过 RTMP 推流，你可以：

- **远程实时监控** — 在任意地点通过播放器查看 NE301 的实时画面，无需在同一内网
- **AI 推理可视化** — 直观验证 NE301 端侧 AI 模型的检测效果和画面质量
- **多平台集成** — RTMP 是直播领域的通用协议，可对接 OBS、YouTube、企业监控平台等
- **视频存档** — 后端服务器可自动录制推流内容，便于回溯和审查

典型应用场景包括：远程设备调试、施工现场监控、无人值守场景巡检、智能零售货架可视化等。

**供电建议**：RTMP 实时推流属于持续高负载场景，需要稳定的供电保障。推荐选择 [NE301 PoE 版本](https://www.camthink.ai/store/ne301-poe/)，通过一根网线即可同时实现供电和网络传输，部署简洁可靠。标准版 NE301 用户也可使用 USB 长供电（Type-C 5V）进行长时间推流。

### 工作原理

NE301 通过 WiFi 或有线网络，将 H.264 编码的视频流以 RTMP 协议推送到后端的 Nginx-RTMP 服务器。服务器接收后，播放端（如 VLC、FFplay）即可拉取同一地址观看实时画面。

**网络要求**：NE301 与 RTMP 服务器之间只需网络可达（能访问 1935 端口），不要求在同一内网。跨网段或公网环境需确保防火墙放行 1935 端口。

## 2. 准备工作

### 硬件要求

- **NE301 设备**：已开机，已完成 WiFi 或有线网络配置
- **电脑或者服务器**：用于搭建 RTMP 服务器（支持 macOS / Windows / Linux）

### 软件要求

| 软件 | 用途 | 安装方式 |
|------|------|---------|
| Nginx + RTMP 模块 | 接收 RTMP 推流 | Homebrew (macOS) / apt (Linux) |
| VLC 播放器 | 播放 RTMP 视频流 | [videolan.org](https://www.videolan.org/) 下载 |
| FFmpeg（可选） | 命令行播放与调试 | Homebrew 安装 |

### 网络验证

确保 NE301 与 RTMP 服务器网络互通。在 NE301 的 Web 管理界面中（功能调试 → 网络工具），ping RTMP 服务器的 IP 地址，确认连通。

## 3. 搭建 RTMP 服务器

本节以 macOS 为例，使用 Homebrew 安装 Nginx-RTMP。Linux 用户可参考 [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module) 自行编译安装。

### 3.1 安装 Nginx-RTMP

打开终端，执行以下命令：

```bash
# 安装带 RTMP 模块的 Nginx
brew install nginx-full --with-rtmp
```

安装完成后，验证 RTMP 模块是否加载：

```bash
nginx -V 2>&1 | grep rtmp
```

如果输出中包含 `--add-module=...rtmp...`，说明安装成功。

### 3.2 配置 RTMP 服务

编辑 Nginx 配置文件：

```bash
# macOS 默认路径
nano /opt/homebrew/etc/nginx/nginx.conf
```

打开后可以看到 Nginx 的默认配置内容：

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/nginx.png" alt="Nginx 默认配置文件" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

在配置文件末尾（`http {}` 块的外面）添加 RTMP 配置：

```nginx
rtmp {
    server {
        listen 1935;          # RTMP 默认端口
        chunk_size 4096;

        application live {
            live on;          # 启用直播
            record all;       # 录制所有推流
            record_path /tmp/rtmp-recordings;                    # 录制文件保存路径
            record_suffix -%Y-%m-%d_%H-%M-%S.flv;                # 文件名格式
        }
    }
}
```

修改完成后的配置文件效果如下：

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/nginx-configuration-details.png" alt="Nginx RTMP 配置详情" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**注意**: `rtmp {}` 块必须放在 `http {}` 块的外面，作为顶级配置块，否则会报错。

### 3.3 启动与验证

验证配置是否正确：

```bash
nginx -t
```

输出 `syntax is ok` 和 `test is successful` 即表示配置正确。

启动 Nginx：

```bash
# 首次启动
nginx

# 如果已在运行，重新加载配置
nginx -s reload
```

确认 1935 端口已监听：

```bash
# macOS / Linux
lsof -i :1935
```

如果输出中显示 `nginx ... TCP *:macromedia-fcs (LISTEN)`，说明 RTMP 服务已就绪。

## 4. 配置 NE301 推流

### 4.1 进入 RTMP 设置

1. 连接 NE301 的 WiFi 热点（SSID 格式：`NE301_<MAC后6位>`），或确保你的电脑与 NE301 在同一网络
2. 浏览器访问 NE301 管理地址：`http://192.168.10.10`
3. 输入密码登录（默认密码：`hicamthink`）
4. 进入 **「功能调试」 → 「媒体流设置」**

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/NE301-RTMP-settings.png" alt="NE301 RTMP 设置界面" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 4.2 填写推流地址

在媒体流设置页面，找到 RTMP 相关配置项，填写以下信息：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| 服务器地址 | Nginx-RTMP 服务器的 IP 或域名 | `192.168.1.100` |
| 端口 | RTMP 端口 | `1935` |
| 推流密钥（Stream Key） | 自定义标识，用于区分不同设备 | `test` |

如上方截图所示，本示例中推流密钥填写的是 `test`。

完整的推流地址格式为：

```
rtmp://<服务器IP>:1935/live/<推流密钥>
```

例如：`rtmp://192.168.1.100:1935/live/test`

**说明**：
- `live` 对应 Nginx 配置中的 `application live`
- 推流密钥可自定义，用于区分不同设备或不同场景
- 如果有多个 NE301，建议使用不同的密钥（如 `device-a`、`device-b`）

### 4.3 启动推流

配置完成后，点击 **「启用」** 按钮开启 RTMP 推流。NE301 将开始向服务器推送实时视频流。

## 5. 播放与验证

### 5.1 使用 VLC 播放 RTMP 流

VLC 是一款免费、跨平台的多媒体播放器，支持直接播放 RTMP 流。

**步骤 1：打开网络串流**

打开 VLC 播放器，点击菜单栏 **「媒体」 → 「打开网络串流...」**（macOS 为 **「文件」 → 「打开网络...」**）。
<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/vlc-settings.png" alt="VLC 缓冲设置" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

**步骤 2：输入地址并播放**

在「打开网络串流」窗口中，输入 NE301 的 RTMP 地址：

```
rtmp://<服务器IP>:1935/live/test
```

如果在本机播放（VLC 和 Nginx-RTMP 在同一台电脑上），可以用 `localhost` 替代服务器 IP：

```
rtmp://localhost/live/test
```

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/vlc-open-link.png" alt="VLC 打开网络串流" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

点击 **「播放」** 即可看到 NE301 的实时画面。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/vlc-watch-rtmp-stream.png" alt="VLC 播放 RTMP 流" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 5.2 其他验证方式

除了 VLC，你也可以用命令行工具快速验证：

```bash
# 使用 FFplay 播放（降低延迟）
ffplay -fflags nobuffer -flags low_delay rtmp://<服务器IP>:1935/live/ne301-camera-01

# 查看推流连接状态
lsof -i :1935

# 查看 Nginx 错误日志
tail -f /opt/homebrew/var/log/nginx/error.log
```

## 6. 录制管理

### 6.1 录制文件查看

如果按照 3.2 节开启了录制，推流结束后可在服务器上查看录制文件：

```bash
# 查看录制文件列表
ls -lh /tmp/rtmp-recordings/
```

录制文件以 FLV 格式保存，文件名包含流密钥和录制时间，例如：

```
test-2026-03-30_13-30-49.flv
```

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/rtmp-video-streaming/rtmp-local-recording.png" alt="RTMP 录制文件" style={{ maxWidth: '560px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 6.2 常用操作

```bash
# 使用 FFplay 播放录制文件
ffplay /tmp/rtmp-recordings/test-2026-03-30_13-30-49.flv

# 使用 FFmpeg 转为 MP4 格式
ffmpeg -i /tmp/rtmp-recordings/test-2026-03-30_13-30-49.flv -c copy output.mp4
```

**注意**：示例中 `/tmp` 目录在系统重启后会被清空。如需持久保存，请将 Nginx 配置中的 `record_path` 改为其他目录（如 `/home/user/recordings`），并重新加载配置 `nginx -s reload`。

## 7. 故障排查

### NE301 端推流失败

| 错误现象 | 可能原因 | 解决方法 |
|----------|---------|---------|
| `WriteN, RTMP send error 119` | 连接中断或握手失败 | 检查服务器 IP 和端口是否正确 |
| `WriteN, RTMP send error 9` | 文件描述符失效，连接已断开 | 检查网络稳定性，尝试重新推流 |
| 推流启动后立即断开 | RTMP 服务器未运行 | 确认 nginx 已启动且 1935 端口在监听 |

### 服务器端排查

```bash
# 检查 Nginx 是否在运行
ps aux | grep nginx

# 检查 1935 端口是否在监听
lsof -i :1935

# 查看 Nginx 错误日志
cat /opt/homebrew/var/log/nginx/error.log

# 验证配置是否正确
nginx -t
```

### 网络连通性排查

```bash
# 从 NE301 网络侧测试服务器端口是否可达
# 在 NE301 Web 管理界面中使用网络工具 ping 服务器 IP

# 从电脑侧测试
nc -zv <服务器IP> 1935
```

**常见网络问题**：
- **防火墙**：确保服务器防火墙放行了 1935 端口（TCP）
- **NAT/端口映射**：如果服务器在 NAT 后面（如家庭网络），需在路由器上做 1935 端口映射
- **跨网段**：确保 NE301 和服务器之间的路由可达

## 8. 附录

### nginx.conf 完整配置参考

```nginx
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    server {
        listen       8080;
        server_name  localhost;

        location / {
            root   html;
            index  index.html;
        }
    }
}

# RTMP 服务
rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record all;
            record_path /tmp/rtmp-recordings;
            record_suffix -%Y-%m-%d_%H-%M-%S.flv;
        }
    }
}
```

### 常用工具

| 工具 | 用途 | 平台 |
|------|------|------|
| [NE301](https://www.camthink.ai/store/ne301-poe/) | 边缘 AI 智能相机，RTMP 推流源 | — |
| [Nginx-RTMP](https://github.com/arut/nginx-rtmp-module) | RTMP 推流接收服务器 | 全平台 |
| [VLC](https://www.videolan.org/) | RTMP 流播放 | 全平台 |
| [FFmpeg](https://ffmpeg.org/) | 命令行推流/播放/转码 | 全平台 |