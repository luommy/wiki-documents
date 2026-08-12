---
description: NE503 附录：aipc-cli 命令行速查（system / app / device / stream / model 各模块命令与输出格式）以及按症状组织的故障排查表。
keywords: [NE503 aipc-cli, 命令行, CLI 速查, 故障排查, 排障, Troubleshooting, 症状]
tags: [用户指南, NE503, CLI, 排障]
---

# Troubleshooting

通过 Web 终端（Maintenance → Terminal）或 SSH 登录设备后，可用 `aipc-cli` 统一管理应用、模型、设备、码流与系统。本附录给出命令速查与按症状组织的故障排查。

## aipc-cli 命令速查

```bash
# 系统
aipc-cli system info              # 设备信息
aipc-cli system health            # 健康检查

# 应用
aipc-cli app list                 # 列出应用
aipc-cli app start <id>           # 启动应用
aipc-cli app stop <id>            # 停止应用
aipc-cli app logs <id> -f         # 实时查看应用日志

# 设备（镜头 / 红外）
aipc-cli device status            # 设备状态
aipc-cli device zoom in 5         # 变焦（in / out / stop，速度 1-10）
aipc-cli device focus auto        # 自动对焦

# 码流
aipc-cli stream list              # 列出码流状态
aipc-cli stream url <id>          # 查看码流 RTSP 地址

# 模型
aipc-cli model list               # 列出模型
aipc-cli model register <path>    # 注册新模型
```

**输出格式**：所有命令支持 `-o table`（默认）/ `-o json` / `-o yaml`，便于脚本解析。

> CLI 覆盖了 Web 控制台的大部分管理操作，适合批量操作、自动化脚本与远程排障。

## 症状化排障

按"现象"对号入座找排查路径。

### 无法访问 Web 控制台

1. 确认电脑 IP 与设备同网段（默认 `10.0.0.x`）
2. `ping 10.0.0.1`（或设备实际 IP）确认网络连通
3. 若设备是 DHCP，去路由器查它分到的 IP
4. 浏览器确认用的是 `https://`（不是 http），并放行证书警告
5. 仍不行：SSH 登录（`root` / `root`）后 `aipc-cli system health` 看服务状态

### RTSP 流无法播放

1. 确认拉流端与设备同网段
2. 确认设备 IP 未变更（DHCP 可能换 IP）
3. `aipc-cli stream list` 确认码流启用、RTSP 已开
4. 核对地址端口：`rtsp://<设备IP>:8554/main`，默认端口 8554
5. 防火墙是否放行 8554

### 容器应用启动失败

1. `aipc-cli app logs <id>` 看错误日志
2. 检查资源（Dashboard 内存 / 存储）是否不足
3. 若拉取镜像失败，检查外网连通
4. Permissions 配置不当（如应用要码流但未授权）也会启动失败

### 模型导入成功但无检测结果

1. 模型是否 **Loaded**（Models 页或 `aipc-cli model list`）——未加载则不会推理
2. 应用 Permissions 是否勾选了该模型
3. **Threshold 是否过高**——Detail 弹窗调低阈值重试
4. 输入尺寸是否匹配（平台前处理固定输出 384×640 NV12）
5. 码流是否启用且应用已授权对应码流

### Event Bus 收不到事件

1. 应用 Permissions 的 Publish / Subscribe Topics 是否配对
2. 集成端订阅的 topic 是否与应用发布的一致（注意通配符 `*` / `#`）
3. 网络模式：Isolated 模式下应用无外网，Event Bus 走平台内部总线，确认订阅端连的是设备 Event Bus

### 磁盘空间不足

1. Maintenance → File Manager 查 `/data/aipc/logs`、录像、模型文件占用
2. 清理旧日志与不需要的录像 / 镜像
3. 超过 80% 考虑插 microSD 扩展（Settings → Storage）
4. 容器日志无限增长时，调应用的日志策略

### 忘记 Web 密码

SSH 登录（`root` / `root`）后用 `aipc-cli` 重置，或进 Device Info → Change Password（若仍能登录）。
