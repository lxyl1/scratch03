// player.js - 播放器页面逻辑

// 使用 helloai.online 播放器的项目列表（手动配置需要AI插件的作品）
const AI_PROJECTS = [
    // 在这里添加需要AI插件的作品名称
    // 例如：'舞动皮影.sb3',
];

// 自动检测项目是否包含AI扩展
const AI_EXTENSIONS = ['image', 'helloai', '肢', 'AI', '人工智能'];

document.addEventListener('DOMContentLoaded', function() {
    loadProject();
});

// 获取URL参数
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 加载项目
async function loadProject() {
    const projectName = getUrlParameter('project');
    
    if (!projectName) {
        showError('未找到项目文件');
        return;
    }

    // 更新页面标题
    const displayName = projectName.replace(/\.(sb2|sb3|html)$/i, '');
    document.getElementById('project-title').textContent = displayName;

    const wrapper = document.getElementById('player-wrapper');
    wrapper.innerHTML = '';

    // 如果是 HTML 文件（已打包），直接加载
    if (projectName.endsWith('.html')) {
        const htmlUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
        
        const iframe = document.createElement('iframe');
        iframe.src = htmlUrl;
        iframe.allow = 'autoplay; fullscreen; camera; microphone; clipboard-write';
        iframe.allowFullscreen = true;
        iframe.className = 'player-iframe';
        
        iframe.onload = function() {
            console.log('打包项目加载完成');
        };
        
        wrapper.appendChild(iframe);
        return;
    }

    // 检查是否应该使用 helloai.online 播放器
    const shouldUseHelloAI = await shouldUseHelloAIPlayer(projectName);
    
    if (shouldUseHelloAI) {
        console.log('检测到 AI 插件，使用 helloai.online 播放器');
        loadWithHelloAI(projectName, wrapper);
    } else {
        console.log('使用 TurboWarp 播放器');
        loadWithTurboWarp(projectName, wrapper);
    }
}

// 判断是否应该使用 helloai.online 播放器
async function shouldUseHelloAIPlayer(projectName) {
    // 1. 检查是否在手动配置列表中
    if (AI_PROJECTS.includes(projectName)) {
        return true;
    }
    
    // 2. 对于 .sb3 文件，下载并检测是否包含AI扩展
    if (projectName.endsWith('.sb3')) {
        try {
            const projectUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
            const response = await fetch(projectUrl);
            
            if (!response.ok) {
                return false;
            }
            
            // 读取 sb3 文件（实际是 zip 文件）
            const arrayBuffer = await response.arrayBuffer();
            
            // 将 ArrayBuffer 转换为字符串（检查是否包含 AI 扩展关键词）
            const uint8Array = new Uint8Array(arrayBuffer);
            const decoder = new TextDecoder('utf-8');
            
            // 只检查前 50KB，因为 JSON 在项目文件开头
            const checkSize = Math.min(50 * 1024, uint8Array.length);
            const textContent = decoder.decode(uint8Array.slice(0, checkSize));
            
            // 检查是否包含 AI 扩展关键词
            for (const keyword of AI_EXTENSIONS) {
                if (textContent.includes(keyword)) {
                    console.log(`检测到 AI 扩展关键词: ${keyword}`);
                    return true;
                }
            }
        } catch (error) {
            console.error('检测项目失败，默认使用 TurboWarp:', error);
        }
    }
    
    return false;
}

// 使用 helloai.online 播放器加载项目
function loadWithHelloAI(projectName, wrapper) {
    const projectUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
    
    // 添加说明：helloai.online 不支持嵌入外部项目
    const info = document.createElement('div');
    info.className = 'player-info-notice';
    info.innerHTML = `
        <div style="padding: 16px; background: #f0f4ff; border-radius: 12px; margin-bottom: 16px; text-align: center;">
            <p style="color: #667eea; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                🤖 此作品使用 AI 肢体识别插件
            </p>
            <p style="color: #4a5568; font-size: 14px; margin-bottom: 16px; line-height: 1.6;">
                AI 插件仅在 helloai.online 平台可用，无法直接嵌入播放<br>
                请选择以下方案之一：
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="openInHelloAI('${projectUrl}')">
                    🌐 在 helloai.online 中打开
                </button>
                <button class="btn btn-secondary" onclick="showConversionGuide()">
                    📦 转换为HTML版本
                </button>
                <button class="btn btn-secondary" onclick="tryFallbackPlayer('${projectName}')">
                    🔄 尝试备用播放器
                </button>
            </div>
        </div>
    `;
    wrapper.appendChild(info);
    
    // 显示下载按钮，让用户下载后在本地或 helloai.online 打开
    const downloadBtn = document.createElement('div');
    downloadBtn.innerHTML = `
        <div style="text-align: center; padding: 12px; background: #fff3cd; border-radius: 8px; margin-top: 12px;">
            <p style="color: #856404; font-size: 13px; margin-bottom: 8px;">
                💡 提示：下载作品后，可以在 helloai.online 中加载此文件
            </p>
            <button class="btn btn-secondary" onclick="downloadProject('${projectName}')">
                ⬇️ 下载作品文件
            </button>
        </div>
    `;
    wrapper.appendChild(downloadBtn);
}

// 在 helloai.online 中打开项目
function openInHelloAI(projectUrl) {
    // 打开 helloai.online 官网，用户需要手动加载项目
    window.open('https://helloai.online/', '_blank');
    
    // 显示提示
    alert('✅ 已打开 helloai.online\n\n请在该网站中：\n1. 点击"从计算机加载"或拖拽 .sb3 文件\n2. 或者下载作品后在该网站加载');
}

// 显示转换指南
function showConversionGuide() {
    const wrapper = document.getElementById('player-wrapper');
    wrapper.innerHTML = `
        <div style="padding: 24px; max-width: 700px; margin: 0 auto;">
            <h2 style="color: #667eea; margin-bottom: 20px;">📦 将 .sb3 转换为 HTML 版本</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-bottom: 12px;">方案一：使用在线转换工具（推荐）</h3>
                <ol style="color: #555; line-height: 2; padding-left: 20px;">
                    <li>访问 <a href="https://sheeptester.github.io/words-go-here/scratch3-htmlifier/" target="_blank" style="color: #667eea;">Scratch HTMLifier 在线工具</a></li>
                    <li>上传你的 .sb3 文件</li>
                    <li>选择 "HTMLify without minification (recommended)"</li>
                    <li>下载生成的 .html 文件</li>
                    <li>将 HTML 文件上传到你的 GitHub 仓库</li>
                    <li>在作品列表中点击该 HTML 文件即可在线播放</li>
                </ol>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-bottom: 12px;">方案二：使用 helloai.online</h3>
                <ol style="color: #555; line-height: 2; padding-left: 20px;">
                    <li>下载作品文件（.sb3）</li>
                    <li>访问 <a href="https://helloai.online/" target="_blank" style="color: #667eea;">helloai.online</a></li>
                    <li>在 helloai.online 中加载 .sb3 文件</li>
                    <li>如果需要网页嵌入，联系 helloai.online 获取嵌入代码</li>
                </ol>
            </div>
            
            <div style="text-align: center; margin-top: 24px;">
                <button class="btn btn-primary" onclick="downloadCurrentProject()">
                    ⬇️ 下载当前作品
                </button>
                <button class="btn btn-secondary" onclick="goBack()" style="margin-left: 12px;">
                    ← 返回作品列表
                </button>
            </div>
        </div>
    `;
}

// 下载当前作品
function downloadCurrentProject() {
    const projectName = getUrlParameter('project');
    if (projectName) {
        downloadProject(projectName);
    }
}

// 使用 TurboWarp 播放器加载项目
function loadWithTurboWarp(projectName, wrapper) {
    const projectUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
    const turboWarpUrl = `https://turbowarp.org/embed?project_url=${encodeURIComponent(projectUrl)}&autoplay&extensions=videoSensing&sandbox=1`;
    
    const iframe = document.createElement('iframe');
    iframe.src = turboWarpUrl;
    iframe.allow = 'autoplay; fullscreen; camera; microphone; clipboard-write';
    iframe.allowFullscreen = true;
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms';
    iframe.className = 'player-iframe';
    
    iframe.onload = function() {
        console.log('TurboWarp 项目加载完成');
        document.querySelector('.loading-player')?.remove();
    };
    
    // 如果 TurboWarp 加载失败，提供切换按钮
    iframe.onerror = function() {
        showSwitchToHelloAI(projectName);
    };
    
    wrapper.appendChild(iframe);
}

// 显示切换到 helloai.online 的选项
function showSwitchToHelloAI(projectName) {
    const wrapper = document.getElementById('player-wrapper');
    const info = document.createElement('div');
    info.className = 'switch-player-notice';
    info.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #fff3cd; border-radius: 12px; margin: 20px;">
            <p style="color: #856404; margin-bottom: 12px; font-size: 14px;">
                ⚠️ TurboWarp 无法加载此项目（可能使用了自定义扩展）
            </p>
            <button class="btn btn-primary" onclick="forceUseHelloAI('${projectName}')">
                🔄 切换到 helloai.online 播放器
            </button>
        </div>
    `;
    wrapper.appendChild(info);
}

// 强制使用 helloai.online 播放器
function forceUseHelloAI(projectName) {
    const wrapper = document.getElementById('player-wrapper');
    wrapper.innerHTML = '';
    
    // 添加到配置列表
    if (!AI_PROJECTS.includes(projectName)) {
        AI_PROJECTS.push(projectName);
    }
    
    loadWithHelloAI(projectName, wrapper);
}

// 显示错误信息
function showError(message) {
    const wrapper = document.getElementById('player-wrapper');
    wrapper.innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <h3>加载失败</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="goBack()">返回作品列表</button>
        </div>
    `;
}

// 返回作品列表
function goBack() {
    window.location.href = 'index.html';
}

// 全屏切换
function toggleFullscreen() {
    const wrapper = document.getElementById('player-wrapper');
    
    if (!document.fullscreenElement) {
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) {
            wrapper.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', function() {
    const btn = document.getElementById('fullscreen-btn');
    if (document.fullscreenElement) {
        btn.textContent = '⛶ 退出全屏';
    } else {
        btn.textContent = '⛶ 全屏';
    }
});
