import mockAPI from './mockApi';

// 开发环境配置
const isDevelopment = import.meta.env.DEV;
const useMockAPI = isDevelopment && (import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_USE_MOCK_API);

// API基础URL，配置为实际的Cloudflare Workers URL
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://prompthub-api.5zd20.workers.dev'
  : '/api'; // 在开发环境中，使用Vite代理

// 获取所有提示词
export const getAllPrompts = async () => {
  // 使用模拟API
  if (useMockAPI) {
    return await mockAPI.getAllPrompts();
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/prompts`);
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取提示词失败:', error);
    // 如果API不可用，返回空数组
    return [];
  }
};

// 获取单个提示词
export const getPrompt = async (id) => {
  // 使用模拟API
  if (useMockAPI) {
    return await mockAPI.getPrompt(id);
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`);
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`获取提示词 ${id} 失败:`, error);
    throw error;
  }
};

// 创建提示词
export const createPrompt = async (promptData) => {
  // 使用模拟API
  if (useMockAPI) {
    return await mockAPI.createPrompt(promptData);
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptData),
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建提示词失败:', error);
    throw error;
  }
};

// 更新提示词
export const updatePrompt = async (id, promptData) => {
  // 使用模拟API
  if (useMockAPI) {
    return await mockAPI.updatePrompt(id, promptData);
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptData),
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`更新提示词 ${id} 失败:`, error);
    throw error;
  }
};

// 删除提示词
export const deletePrompt = async (id) => {
  // 使用模拟API
  if (useMockAPI) {
    return await mockAPI.deletePrompt(id);
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`删除提示词 ${id} 失败:`, error);
    throw error;
  }
};

// 获取所有标签
export const getAllTags = async () => {
  // 使用模拟API
  if (useMockAPI) {
    // 如果模拟API没有标签接口，可以返回空数组
    return [];
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取标签失败:', error);
    // 如果API不可用，返回空数组
    return [];
  }
};

// 获取单个标签
export const getTag = async (name) => {
  // 使用模拟API
  if (useMockAPI) {
    // 如果模拟API没有标签接口，可以返回默认值
    return { name, count: 0, promptIds: [] };
  }
  
  // 使用真实API
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${name}`);
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`获取标签 ${name} 失败:`, error);
    throw error;
  }
}; 