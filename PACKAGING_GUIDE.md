# TurboWarp Packager 打包指南

## 快速解决第三方扩展问题

### 第一步：访问打包工具
打开 https://packager.turbowarp.org/

### 第二步：上传你的项目
- 点击 "Choose a .sb3 file"
- 或直接拖拽文件到页面

### 第三步：配置打包选项

**必选项：**
- ✅ **Load extensions from custom URL**
- ✅ **Request camera permission**（肢体识别需要摄像头）
- ✅ **Include fullscreen button**

**自定义扩展（如有）：**
在 "Custom extensions" 输入框中添加扩展的 JavaScript URL

### 第四步：打包并下载
- 点击 **Package** 按钮
- 等待生成完成
- 下载生成的 HTML 文件

### 第五步：上传到 GitHub

**目录结构：**
```
public/projects/
├── py.sb3          ← 原始文件（保留）
└── py.html         ← 打包后的文件（新增）
```

### 第六步：完成！

系统已自动支持 .html 文件加载，刷新页面即可看到效果。

---

## 注意事项

1. **摄像头权限**：打包时务必勾选摄像头权限
2. **文件命名**：HTML 文件名应与 .sb3 文件保持一致
3. **两个文件都保留**：.sb3 用于下载，.html 用于播放
4. **首次加载**：AI 模型可能需要几秒加载时间
