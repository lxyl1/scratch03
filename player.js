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
    const displayName = projectName.replace(/\.(sb2|sb3)$/i, '');
    document.getElementById('project-title').textContent = displayName;

    // 使用 GitHub raw URL（更可靠）
    const projectUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
    
    // 备用 URL（jsDelivr CDN）
    const backupUrl = `https://cdn.jsdelivr.net/gh/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}@${CONFIG.GITHUB_BRANCH}/${CONFIG.PROJECTS_DIR}${projectName}`;
    
    // 先尝试 raw URL，如果失败再使用 CDN
    const turboWarpUrl = `https://turbowarp.org/embed?project_url=${encodeURIComponent(projectUrl)}&autoplay`;

    // 创建 iframe
    const wrapper = document.getElementById('player-wrapper');
    wrapper.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = turboWarpUrl;
    iframe.allow = 'autoplay; fullscreen';
    iframe.allowFullscreen = true;
    iframe.className = 'player-iframe';

    // 加载完成事件
    iframe.onload = function() {
        console.log('项目加载完成');
    };

    wrapper.appendChild(iframe);
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
