# Scratch 作品集

一个纯前端实现的 Scratch 作品展示网页，支持从 GitHub 读取项目、本地上传 .sb3 文件并实时推送至 GitHub，以及使用 TurboWarp 在线演示作品。

## ✨ 功能特性

- 📂 **作品展示** - 从 GitHub 仓库加载并展示所有 Scratch 项目
- ⬆️ **本地上传** - 支持上传 .sb2 和 .sb3 文件，自动推送到 GitHub
- ▶️ **在线演示** - 使用 TurboWarp 嵌入播放器在线运行 Scratch 作品
- ⬇️ **下载功能** - 可以直接下载 GitHub 上的项目文件
- 🗑️ **删除管理** - 可以删除不需要的项目
- 📱 **响应式设计** - 支持桌面和移动设备访问
- 🎨 **现代化UI** - 渐变色卡片、流畅动画效果

## 🚀 快速开始

### 1. 生成 GitHub Token

在使用之前，需要生成一个 GitHub Personal Access Token：

1. 访问 [GitHub Token 设置页面](https://github.com/settings/tokens)
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置 Token 名称（例如：Scratch Portfolio）
4. 勾选权限：**`repo`**（完整仓库访问权限）
5. 点击 **"Generate token"** 生成
6. **复制 Token**（只显示一次，请妥善保存）

### 2. 配置 GitHub Pages

1. 访问你的仓库：https://github.com/lxyl1/scratch03
2. 进入 **Settings** → **Pages**
3. 在 **Source** 中选择 **Deploy from a branch**
4. 选择分支：**main**，文件夹：**/ (root)**
5. 点击 **Save**
6. 等待几分钟，GitHub Pages 会自动部署
7. 访问地址：`https://lxyl1.github.io/scratch03/`

### 3. 创建项目目录结构

在你的 GitHub 仓库中创建以下目录结构：

```
scratch03/
├── index.html
├── player.html
├── player.js
├── styles.css
├── app.js
├── config.js
├── README.md
└── public/
    └── projects/          # 所有 .sb3 文件存放在这里
        ├── project1.sb3
        └── project2.sb3
```

可以使用以下命令创建目录：

```bash
mkdir -p public/projects
```

### 4. 首次使用

1. 打开网页：`https://lxyl1.github.io/scratch03/`
2. 首次访问会弹出 Token 输入框
3. 输入之前生成的 GitHub Token
4. Token 会保存在浏览器的 localStorage 中
5. 开始上传你的 Scratch 作品！

## 📖 使用说明

### 上传作品

1. 点击页面右上角的 **"本地上传 (.sb2/.sb3)"** 按钮
2. 选择或拖拽 .sb2/.sb3 文件到上传区域
3. 点击 **"上传"** 按钮
4. 等待上传完成，文件会自动推送到 GitHub

### 在线演示

1. 点击作品卡片上的 **"在线演示"** 按钮
2. 跳转到播放器页面
3. 使用 TurboWarp 在线运行 Scratch 作品
4. 支持全屏模式

### 下载作品

1. 点击作品卡片上的 **"下载"** 按钮
2. 文件会自动下载到本地

### 删除作品

1. 点击作品卡片右上角的 **"⋮"** 菜单按钮
2. 确认删除操作
3. 文件会从 GitHub 仓库中删除

### 修改 Token

如果需要修改或更新 Token：

1. 打开浏览器开发者工具（F12）
2. 进入 **Application** → **Local Storage**
3. 找到 `github_token` 键
4. 删除或修改该值
5. 刷新页面重新输入 Token

## 🔧 自定义配置

如果需要修改配置，编辑 `config.js` 文件：

```javascript
const CONFIG = {
  GITHUB_USER: 'lxyl1',           // 你的 GitHub 用户名
  GITHUB_REPO: 'scratch03',       // 你的仓库名
  GITHUB_BRANCH: 'main',          // 分支名
  PROJECTS_DIR: 'public/projects/', // 项目文件目录
};
```

## 🛠️ 本地开发

### 使用 VS Code Live Server

1. 安装 VS Code 扩展：**Live Server**
2. 右键点击 `index.html`
3. 选择 **"Open with Live Server"**
4. 浏览器自动打开页面

### 使用 Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器访问：`http://localhost:8000`

### 使用 Node.js http-server

```bash
# 安装
npm install -g http-server

# 运行
http-server -p 8000
```

## 📁 项目结构

```
scratch03/
├── index.html          # 主页面（作品列表）
├── player.html         # 在线演示播放器页面
├── player.js           # 播放器页面逻辑
├── styles.css          # 全局样式文件
├── app.js              # 主要应用逻辑
├── config.js           # 配置文件
└── README.md           # 使用说明文档
```

## 🔑 技术栈

- **纯前端实现** - HTML5 + CSS3 + JavaScript (ES6+)
- **GitHub API** - 使用 REST API 进行文件管理
- **TurboWarp** - 嵌入 TurboWarp 播放器运行 Scratch 作品
- **jsDelivr CDN** - 快速获取 GitHub 上的项目文件
- **FileReader API** - 本地文件读取和 Base64 编码

## ⚠️ 注意事项

1. **Token 安全**：Token 存储在浏览器 localStorage 中，请勿在公共电脑上使用
2. **文件大小**：GitHub API 对单个文件有限制（最大 100MB）
3. **API 速率限制**：未认证用户每小时 60 次请求，认证用户每小时 5000 次请求
4. **CORS 限制**：部分浏览器可能限制本地文件的 CORS，建议使用 HTTP 服务器运行
5. **jsDelivr 缓存**：上传后可能需要等待几分钟才能在 CDN 上更新

## 🐛 故障排除

### 无法加载作品

- 检查 Token 是否有效
- 确认 GitHub 仓库和目录结构正确
- 检查浏览器控制台错误信息

### 上传失败

- 确认 Token 有 `repo` 权限
- 检查文件是否为 .sb2 或 .sb3 格式
- 确认文件大小不超过 100MB

### 播放器无法加载

- 检查文件是否正确上传到 GitHub
- 等待 jsDelivr CDN 缓存更新（可能需要几分钟）
- 尝试清除浏览器缓存

### Token 无效

- 重新生成 GitHub Token
- 在浏览器开发者工具中清除 localStorage 的 `github_token`
- 刷新页面重新输入 Token

## 📝 许可证

本项目仅供个人使用。

## 🙏 致谢

- [TurboWarp](https://turbowarp.org/) - Scratch 作品播放器
- [jsDelivr](https://www.jsdelivr.com/) - CDN 加速服务
- [GitHub API](https://docs.github.com/en/rest) - 文件管理接口

---

**祝你使用愉快！** 🎉
