// app.js - 主要应用逻辑

// 全局变量
let selectedFile = null;
let projectsData = [];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    checkToken();
    loadProjects();
    setupUploadArea();
});

// 检查Token是否存在
function checkToken() {
    const token = localStorage.getItem('github_token');
    if (!token) {
        showTokenModal();
    }
}

// 显示Token设置模态框
function showTokenModal() {
    document.getElementById('token-modal').classList.add('active');
}

// 关闭Token模态框
function closeTokenModal() {
    document.getElementById('token-modal').classList.remove('active');
}

// 保存Token
function saveToken() {
    const token = document.getElementById('token-input').value.trim();
    if (!token) {
        alert('请输入有效的 GitHub Token');
        return;
    }
    localStorage.setItem('github_token', token);
    closeTokenModal();
    loadProjects();
}

// 获取Token
function getToken() {
    return localStorage.getItem('github_token');
}

// 从GitHub加载项目列表
async function loadProjects() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('projects-grid');
    
    loadingEl.style.display = 'block';
    gridEl.innerHTML = '';
    
    try {
        const token = getToken();
        if (!token) {
            showTokenModal();
            loadingEl.style.display = 'none';
            return;
        }
        
        const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.PROJECTS_DIR}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('Token无效或已过期,请重新设置');
                localStorage.removeItem('github_token');
                showTokenModal();
            } else if (response.status === 404) {
                // 目录不存在,显示空状态
                gridEl.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 16px;">📂</div>
                        <h3 style="color: #1a202c; margin-bottom: 8px;">暂无作品</h3>
                        <p style="color: #718096;">点击"本地上传"按钮添加你的第一个Scratch作品</p>
                    </div>
                `;
            } else {
                throw new Error(`加载失败: ${response.status}`);
            }
            loadingEl.style.display = 'none';
            return;
        }
        
        const data = await response.json();
        
        // 过滤出.sb2和.sb3文件
        projectsData = data.filter(file => 
            file.name.endsWith('.sb2') || file.name.endsWith('.sb3')
        );
        
        renderProjects(projectsData);
        
    } catch (error) {
        console.error('加载项目失败:', error);
        gridEl.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
                <h3 style="color: #1a202c; margin-bottom: 8px;">加载失败</h3>
                <p style="color: #718096;">${error.message}</p>
            </div>
        `;
    } finally {
        loadingEl.style.display = 'none';
    }
}

// 渲染项目列表
function renderProjects(projects) {
    const gridEl = document.getElementById('projects-grid');
    gridEl.innerHTML = '';
    
    if (projects.length === 0) {
        gridEl.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">📂</div>
                <h3 style="color: #1a202c; margin-bottom: 8px;">暂无作品</h3>
                <p style="color: #718096;">点击"本地上传"按钮添加你的第一个Scratch作品</p>
            </div>
        `;
        return;
    }
    
    projects.forEach((project, index) => {
        const card = createProjectCard(project, index);
        gridEl.appendChild(card);
    });
}

// 创建项目卡片
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const projectName = project.name;
    const displayName = projectName.replace(/\.(sb2|sb3)$/i, '');
    const fileExtension = projectName.split('.').pop().toLowerCase();
    const lastModified = new Date(project.updated_at || project.commit?.commit?.committer?.date).toLocaleDateString('zh-CN');
    
    // 生成随机渐变色作为缩略图
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    const gradient = gradients[index % gradients.length];
    
    card.innerHTML = `
        <div class="project-thumbnail" style="background: ${gradient}">
            <div class="thumbnail-placeholder">${displayName.charAt(0).toUpperCase()}</div>
        </div>
        <div class="project-info">
            <div class="project-title">
                <span>${displayName}</span>
                <button class="project-menu-btn" onclick="deleteProject('${projectName}', '${project.sha || ''}')">⋮</button>
            </div>
            <div class="project-description">
                Scratch ${fileExtension.toUpperCase()} 项目文件
            </div>
            <div class="project-tags">
                <span class="tag">#Scratch</span>
                <span class="tag">#${fileExtension}</span>
            </div>
            <div class="project-meta">
                <div class="author">
                    <div class="author-avatar">我</div>
                    <span>我</span>
                </div>
                <div class="project-date">${lastModified}</div>
            </div>
            <div class="project-actions">
                <button class="btn btn-primary" onclick="playProject('${projectName}')">在线演示</button>
                <button class="btn btn-secondary" onclick="downloadProject('${projectName}')">下载</button>
            </div>
        </div>
    `;
    
    return card;
}

// 设置上传区域
function setupUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    // 点击上传区域
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });
}

// 处理文件选择
function handleFileSelect(file) {
    // 验证文件类型
    if (!file.name.endsWith('.sb2') && !file.name.endsWith('.sb3')) {
        alert('请选择 .sb2 或 .sb3 格式的 Scratch 文件');
        return;
    }
    
    selectedFile = file;
    document.getElementById('selected-file-name').textContent = file.name;
    document.getElementById('upload-info').style.display = 'block';
    document.getElementById('upload-btn').disabled = false;
}

// 显示上传模态框
function showUploadModal() {
    document.getElementById('upload-modal').classList.add('active');
    // 重置状态
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('upload-info').style.display = 'none';
    document.getElementById('upload-btn').disabled = true;
    document.getElementById('upload-progress').style.width = '0%';
}

// 关闭上传模态框
function closeUploadModal() {
    document.getElementById('upload-modal').classList.remove('active');
}

// 上传文件到GitHub
async function uploadFile() {
    if (!selectedFile) {
        alert('请先选择文件');
        return;
    }
    
    const token = getToken();
    if (!token) {
        showTokenModal();
        return;
    }
    
    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = '上传中...';
    
    try {
        // 读取文件并转换为Base64
        const base64Content = await fileToBase64(selectedFile);
        
        // 更新进度条
        document.getElementById('upload-progress').style.width = '50%';
        
        // 上传到GitHub
        const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.PROJECTS_DIR}${selectedFile.name}`;
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add project: ${selectedFile.name}`,
                content: base64Content,
                branch: CONFIG.GITHUB_BRANCH
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '上传失败');
        }
        
        // 上传成功
        document.getElementById('upload-progress').style.width = '100%';
        
        setTimeout(() => {
            alert('上传成功!');
            closeUploadModal();
            loadProjects(); // 重新加载项目列表
        }, 500);
        
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败: ' + error.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传';
    }
}

// 文件转Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // 将 ArrayBuffer 转换为 Base64
            const buffer = reader.result;
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 播放项目
function playProject(projectName) {
    window.location.href = `player.html?project=${encodeURIComponent(projectName)}`;
}

// 下载项目
async function downloadProject(projectName) {
    const token = getToken();
    if (!token) {
        showTokenModal();
        return;
    }
    
    try {
        // 获取文件内容
        const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.PROJECTS_DIR}${projectName}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('下载失败');
        }
        
        const data = await response.json();
        
        // 解码Base64并创建下载链接
        const binaryString = atob(data.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = projectName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败: ' + error.message);
    }
}

// 删除项目
async function deleteProject(projectName, sha) {
    if (!confirm(`确定要删除 "${projectName}" 吗?此操作不可恢复!`)) {
        return;
    }
    
    const token = getToken();
    if (!token) {
        showTokenModal();
        return;
    }
    
    try {
        // 如果没有SHA,先获取
        let fileSha = sha;
        if (!fileSha) {
            const apiUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.PROJECTS_DIR}${projectName}`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error('获取文件信息失败');
            }
            
            const data = await response.json();
            fileSha = data.sha;
        }
        
        // 删除文件
        const deleteUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/contents/${CONFIG.PROJECTS_DIR}${projectName}`;
        
        const deleteResponse = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete project: ${projectName}`,
                sha: fileSha,
                branch: CONFIG.GITHUB_BRANCH
            })
        });
        
        if (!deleteResponse.ok) {
            const error = await deleteResponse.json();
            throw new Error(error.message || '删除失败');
        }
        
        alert('删除成功!');
        loadProjects(); // 重新加载项目列表
        
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败: ' + error.message);
    }
}
