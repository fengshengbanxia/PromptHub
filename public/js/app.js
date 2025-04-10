/**
 * PromptHub - 前端应用
 * 处理提示词的添加、编辑、删除、搜索和显示
 */

// 从环境变量或注入的变量获取API地址
function getApiBaseUrl() {
  // 1. 优先使用Cloudflare Pages环境变量注入的全局变量
  if (window.ENV && window.ENV.API_URL) {
    return window.ENV.API_URL;
  }
  
  // 2. 尝试从meta标签获取
  const metaApiUrl = document.querySelector('meta[name="api-base-url"]');
  if (metaApiUrl && metaApiUrl.content) {
    return metaApiUrl.content;
  }
  
  // 3. 本地开发环境
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:8787/api/';
  }
  
  // 4. 默认使用相对路径（适用于Worker和Pages在同一域名下的情况）
  return '/api/';
}

// 设置API基础URL
const API_BASE_URL = getApiBaseUrl();

// DOM元素
const promptsContainer = document.getElementById('prompts-container');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const tagFilter = document.getElementById('tag-filter');
const newPromptButton = document.getElementById('new-prompt');

// 模态框元素
const promptModal = document.getElementById('prompt-modal');
const viewModal = document.getElementById('view-modal');
const confirmModal = document.getElementById('confirm-modal');
const modalTitle = document.getElementById('modal-title');
const promptForm = document.getElementById('prompt-form');
const promptId = document.getElementById('prompt-id');
const promptTitle = document.getElementById('prompt-title');
const promptContent = document.getElementById('prompt-content');
const promptTags = document.getElementById('prompt-tags');
const closeModal = document.getElementById('close-modal');
const cancelButton = document.getElementById('cancel-button');

// 查看模态框元素
const viewTitle = document.getElementById('view-title');
const viewContent = document.getElementById('view-content');
const viewTags = document.getElementById('view-tags');
const copyButton = document.getElementById('copy-button');
const editButton = document.getElementById('edit-button');
const deleteButton = document.getElementById('delete-button');
const closeView = document.getElementById('close-view');

// 确认删除模态框元素
const closeConfirm = document.getElementById('close-confirm');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');

// Toast 通知元素
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const copiedToast = document.getElementById('copied-toast');

// 全局状态
let prompts = [];
let currentPromptId = null;
let allTags = new Set();

// 初始化应用
function initApp() {
  loadPrompts();
  setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
  // 搜索功能
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // 标签筛选
  tagFilter.addEventListener('change', filterPromptsByTag);

  // 新建提示词
  newPromptButton.addEventListener('click', () => openPromptModal());

  // 模态框关闭
  closeModal.addEventListener('click', closePromptModal);
  cancelButton.addEventListener('click', closePromptModal);
  promptModal.addEventListener('click', (e) => {
    if (e.target === promptModal) closePromptModal();
  });

  // 表单提交
  promptForm.addEventListener('submit', handleFormSubmit);

  // 查看模态框
  closeView.addEventListener('click', closeViewModal);
  viewModal.addEventListener('click', (e) => {
    if (e.target === viewModal) closeViewModal();
  });
  copyButton.addEventListener('click', copyPromptContent);
  editButton.addEventListener('click', editCurrentPrompt);
  deleteButton.addEventListener('click', showDeleteConfirmation);

  // 确认删除模态框
  closeConfirm.addEventListener('click', closeConfirmModal);
  cancelDelete.addEventListener('click', closeConfirmModal);
  confirmDelete.addEventListener('click', deleteCurrentPrompt);
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeConfirmModal();
  });
}

// 加载所有提示词
async function loadPrompts() {
  try {
    promptsContainer.innerHTML = '';
    // 添加骨架屏
    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'prompt-skeleton';
      promptsContainer.appendChild(skeleton);
    }

    const response = await fetch(`${API_BASE_URL}prompts`);
    const data = await response.json();
    
    // 清除骨架屏
    promptsContainer.innerHTML = '';
    
    prompts = data;
    
    if (prompts.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      updateTagsList();
      displayPrompts(prompts);
    }
  } catch (error) {
    console.error('加载提示词失败:', error);
    showToast('加载提示词失败，请刷新页面重试');
    promptsContainer.innerHTML = '';
  }
}

// 显示提示词列表
function displayPrompts(promptsList) {
  promptsContainer.innerHTML = '';
  
  if (promptsList.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  promptsList.forEach(prompt => {
    const card = createPromptCard(prompt);
    promptsContainer.appendChild(card);
  });
}

// 创建提示词卡片
function createPromptCard(prompt) {
  const card = document.createElement('div');
  card.className = 'prompt-card';
  card.dataset.id = prompt.id;
  
  // 截取预览内容
  const previewText = prompt.content.length > 150 
    ? prompt.content.substring(0, 150) + '...' 
    : prompt.content;
  
  // 创建时间格式化
  const createdAt = new Date(prompt.createdAt);
  const formattedDate = createdAt.toLocaleDateString();
  
  card.innerHTML = `
    <h3>${escapeHTML(prompt.title)}</h3>
    <div class="prompt-preview">${escapeHTML(previewText)}</div>
    <div class="prompt-footer">
      <div class="tags-container">
        ${prompt.tags.slice(0, 3).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
        ${prompt.tags.length > 3 ? `<span class="tag">+${prompt.tags.length - 3}</span>` : ''}
      </div>
      <span>${formattedDate}</span>
    </div>
  `;
  
  // 点击卡片查看详情
  card.addEventListener('click', () => {
    openViewModal(prompt);
  });
  
  return card;
}

// 打开查看提示词模态框
function openViewModal(prompt) {
  currentPromptId = prompt.id;
  
  viewTitle.textContent = prompt.title;
  viewContent.textContent = prompt.content;
  
  viewTags.innerHTML = '';
  prompt.tags.forEach(tag => {
    const tagSpan = document.createElement('span');
    tagSpan.className = 'tag';
    tagSpan.textContent = tag;
    viewTags.appendChild(tagSpan);
  });
  
  viewModal.classList.remove('hidden');
  setTimeout(() => {
    viewModal.classList.add('active');
  }, 10);
}

// 关闭查看提示词模态框
function closeViewModal() {
  viewModal.classList.remove('active');
  setTimeout(() => {
    viewModal.classList.add('hidden');
  }, 300);
}

// 打开添加/编辑提示词模态框
function openPromptModal(prompt = null) {
  if (prompt) {
    modalTitle.textContent = '编辑提示词';
    promptId.value = prompt.id;
    promptTitle.value = prompt.title;
    promptContent.value = prompt.content;
    promptTags.value = prompt.tags.join(', ');
  } else {
    modalTitle.textContent = '新建提示词';
    promptForm.reset();
    promptId.value = '';
  }
  
  promptModal.classList.remove('hidden');
  setTimeout(() => {
    promptModal.classList.add('active');
    promptTitle.focus();
  }, 10);
}

// 关闭添加/编辑提示词模态框
function closePromptModal() {
  promptModal.classList.remove('active');
  setTimeout(() => {
    promptModal.classList.add('hidden');
    promptForm.reset();
  }, 300);
}

// 处理表单提交
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const id = promptId.value;
  const title = promptTitle.value.trim();
  const content = promptContent.value.trim();
  const tags = promptTags.value.trim();
  
  if (!title || !content || !tags) {
    showToast('请填写所有必填字段');
    return;
  }
  
  try {
    let response;
    let data;
    
    if (id) {
      // 更新提示词
      response = await fetch(`${API_BASE_URL}prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, tags })
      });
      
      data = await response.json();
      
      if (response.ok) {
        // 更新本地数据
        const index = prompts.findIndex(p => p.id === id);
        if (index !== -1) {
          prompts[index] = data;
        }
        
        showToast('提示词已更新');
      } else {
        throw new Error(data.error || '更新失败');
      }
    } else {
      // 添加新提示词
      response = await fetch(`${API_BASE_URL}prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, tags })
      });
      
      data = await response.json();
      
      if (response.ok) {
        // 添加到本地数据
        prompts.push(data);
        showToast('提示词已添加');
      } else {
        throw new Error(data.error || '添加失败');
      }
    }
    
    closePromptModal();
    updateTagsList();
    displayPrompts(prompts);
  } catch (error) {
    console.error('保存提示词失败:', error);
    showToast(`操作失败: ${error.message}`);
  }
}

// 编辑当前提示词
function editCurrentPrompt() {
  const prompt = prompts.find(p => p.id === currentPromptId);
  if (prompt) {
    closeViewModal();
    openPromptModal(prompt);
  }
}

// 显示删除确认模态框
function showDeleteConfirmation() {
  confirmModal.classList.remove('hidden');
  setTimeout(() => {
    confirmModal.classList.add('active');
  }, 10);
}

// 关闭删除确认模态框
function closeConfirmModal() {
  confirmModal.classList.remove('active');
  setTimeout(() => {
    confirmModal.classList.add('hidden');
  }, 300);
}

// 删除当前提示词
async function deleteCurrentPrompt() {
  if (!currentPromptId) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}prompts/${currentPromptId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // 从本地数据中移除
      prompts = prompts.filter(p => p.id !== currentPromptId);
      showToast('提示词已删除');
      
      closeConfirmModal();
      closeViewModal();
      updateTagsList();
      displayPrompts(prompts);
    } else {
      const data = await response.json();
      throw new Error(data.error || '删除失败');
    }
  } catch (error) {
    console.error('删除提示词失败:', error);
    showToast(`删除失败: ${error.message}`);
    closeConfirmModal();
  }
}

// 复制提示词内容到剪贴板
async function copyPromptContent() {
  const content = viewContent.textContent;
  
  try {
    await navigator.clipboard.writeText(content);
    showCopiedToast();
  } catch (error) {
    console.error('复制失败:', error);
    // 备用复制方法
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      showCopiedToast();
    } catch (err) {
      showToast('复制失败，请手动复制');
    }
    
    document.body.removeChild(textarea);
  }
}

// 显示已复制提示
function showCopiedToast() {
  copiedToast.classList.remove('hidden');
  copiedToast.classList.add('active');
  
  setTimeout(() => {
    copiedToast.classList.remove('active');
    setTimeout(() => {
      copiedToast.classList.add('hidden');
    }, 300);
  }, 1500);
}

// 处理搜索
function handleSearch() {
  const query = searchInput.value.trim();
  
  if (!query) {
    displayPrompts(prompts);
    return;
  }
  
  searchPrompts(query);
}

// 搜索提示词
async function searchPrompts(query) {
  try {
    const response = await fetch(`${API_BASE_URL}search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    
    displayPrompts(results);
    
    if (results.length === 0) {
      showToast(`未找到与"${query}"相关的提示词`);
    }
  } catch (error) {
    console.error('搜索失败:', error);
    showToast('搜索失败，请重试');
  }
}

// 更新标签列表
function updateTagsList() {
  allTags = new Set();
  
  prompts.forEach(prompt => {
    prompt.tags.forEach(tag => {
      allTags.add(tag);
    });
  });
  
  // 更新标签筛选下拉框
  tagFilter.innerHTML = '<option value="">全部标签</option>';
  
  Array.from(allTags).sort().forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

// 按标签筛选提示词
function filterPromptsByTag() {
  const selectedTag = tagFilter.value;
  
  if (!selectedTag) {
    displayPrompts(prompts);
    return;
  }
  
  const filtered = prompts.filter(prompt => 
    prompt.tags.some(tag => tag === selectedTag)
  );
  
  displayPrompts(filtered);
}

// 显示消息提示
function showToast(message) {
  toastMessage.textContent = message;
  
  toast.classList.remove('hidden');
  toast.classList.add('active');
  
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 300);
  }, 3000);
}

// HTML转义以防XSS攻击
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
