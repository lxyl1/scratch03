// player.js - 播放器页面逻辑

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
function loadProject() {
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

    // 检测是否为 .sb3 文件并跳转到 helloai
    if (projectName.endsWith('.sb3') || projectName.endsWith('.sb2')) {
        showHelloAiRedirect(projectName);
        return;
    }

    // 普通 .sb3 文件使用 TurboWarp 嵌入
    const projectUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
    const turboWarpUrl = `https://turbowarp.org/embed?project_url=${encodeURIComponent(projectUrl)}&autoplay&extensions=videoSensing`;

    const iframe = document.createElement('iframe');
    iframe.src = turboWarpUrl;
    iframe.allow = 'autoplay; fullscreen; camera; microphone; clipboard-write';
    iframe.allowFullscreen = true;
    iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms';
    iframe.className = 'player-iframe';

    iframe.onload = function() {
        console.log('TurboWarp 项目加载完成');
    };

    wrapper.appendChild(iframe);
}

// 显示跳转到 helloai 的提示
function showHelloAiRedirect(projectName) {
    const wrapper = document.getElementById('player-wrapper');
    wrapper.innerHTML = `
        <div class="helloai-redirect" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 24px;">🤖</div>
            <h2 style="color: #1a202c; margin-bottom: 16px;">此项目需要 helloai 平台支持</h2>
            <p style="color: #718096; margin-bottom: 24px; line-height: 1.8;">
                该项目使用了 helloai.online 的"人工智能 - 肢体识别"扩展<br>
                仅在 helloai 平台上可以运行
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="https://www.helloai.online" target="_blank" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
                    打开 helloai 平台
                </a>
                <button class="btn btn-secondary" onclick="goBack()">
                    ← 返回作品列表
                </button>
            </div>
            <p style="color: #a0aec0; margin-top: 24px; font-size: 13px;">
                提示：请在 helloai.online 中上传此 .sb3 文件来运行<br>
                项目文件可在作品列表中下载
            </p>
        </div>
    `;
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
