### Download Node.js

https://nodejs.org/en/download/

```
# Download and install fnm:
curl -o- https://fnm.vercel.app/install | bash
# Download and install Node.js:
fnm install 22
# Verify the Node.js version:
node -v # Should print "v22.14.0".
# Download and install Yarn:
corepack enable yarn
# Verify Yarn version:
yarn -v
```

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

### Image Upload Tool

本项目包含一个自动化图片上传工具,用于将 Markdown 文档中的本地图片上传到 File Browser 服务器,并自动替换图片链接。

#### 快速开始

```bash
# 进入工具目录
cd .image-upload

# 安装依赖
yarn install

# 配置环境变量
echo "FILE_BROWSER_PASSWORD=your_password" > .env

# 预览模式(推荐首次使用)
yarn upload-images ../docs --dry-run

# 实际上传
yarn upload-images ../docs
```

#### 主要功能

- ✅ 批量上传 Markdown 文档中的本地图片
- ✅ 自动替换图片链接为远程 URL
- ✅ 智能缓存机制,避免重复上传
- ✅ 支持多种图片格式(Markdown、JSX、自定义组件)
- ✅ 并发上传控制,提高效率
- ✅ 详细的错误处理和日志

#### 使用场景

```bash
# 上传单个文件
yarn upload-images ../docs/guide/getting-started.md

# 上传整个目录
yarn upload-images ../docs/

# 强制重新上传(忽略缓存)
yarn upload-images ../docs --force

# 仅预览,不做修改
yarn upload-images ../docs --dry-run
```

#### 详细文档

- [完整使用指南](./.image-upload/README.md)
- [实现文档](./.image-upload/docs/image-uploader-impl.md)

### preview

Link to preview the website: [demo](https://camthink-ai.github.io/wiki-documents/)

