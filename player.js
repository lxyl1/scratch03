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
    
    // helloai.online 的嵌入播放器格式（类似 CodeLab Scratch）
    const helloAIUrl = `https://helloai.online/player.html?sb3url=${encodeURIComponent(projectUrl)}`;
    
    const iframe = document.createElement('iframe');
    iframe.src = helloAIUrl;
    iframe.allow = 'autoplay; fullscreen; camera; microphone; clipboard-write';
    iframe.allowFullscreen = true;
    iframe.className = 'player-iframe';
    
    iframe.onload = function() {
        console.log('helloai.online 项目加载完成');
        document.querySelector('.loading-player')?.remove();
    };
    
    iframe.onerror = function() {
        console.error('helloai.online 加载失败');
    };
    
    // 添加播放器信息提示
    const info = document.createElement('div');
    info.className = 'player-info-notice';
    info.innerHTML = '<p style="color: #667eea; text-align: center; padding: 8px; background: #f0f4ff; border-radius: 8px; margin-bottom: 8px;">🤖 此作品使用 AI 插件，正在使用 helloai.online 播放器加载...</p>';
    wrapper.appendChild(info);
    
    wrapper.appendChild(iframe);
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
