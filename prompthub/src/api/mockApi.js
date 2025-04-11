// 模拟API请求的工具函数
// 在开发环境中，如果后端API不可用，可以使用这些模拟函数

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 从模拟数据或localStorage读取提示词
const getStoredPrompts = async () => {
  try {
    // 尝试从localStorage读取
    const storedData = localStorage.getItem('prompthub-data');
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // 如果localStorage没有数据，从模拟JSON文件获取
    const response = await fetch('/mock/prompts.json');
    if (!response.ok) throw new Error('加载模拟数据失败');
    
    const data = await response.json();
    
    // 保存到localStorage
    localStorage.setItem('prompthub-data', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('获取模拟数据失败:', error);
    return [];
  }
};

// 保存数据到localStorage
const storePrompts = (prompts) => {
  localStorage.setItem('prompthub-data', JSON.stringify(prompts));
};

// 模拟API功能
export const mockAPI = {
  // 获取所有提示词
  getAllPrompts: async () => {
    await delay(300); // 模拟网络延迟
    return await getStoredPrompts();
  },
  
  // 获取单个提示词
  getPrompt: async (id) => {
    await delay(200);
    const prompts = await getStoredPrompts();
    const prompt = prompts.find(p => p.id === id);
    
    if (!prompt) {
      throw new Error('提示词不存在');
    }
    
    return prompt;
  },
  
  // 创建新提示词
  createPrompt: async (promptData) => {
    await delay(500);
    const prompts = await getStoredPrompts();
    
    // 创建新提示词（生成唯一ID）
    const newPrompt = {
      ...promptData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // 添加到列表并保存
    const updatedPrompts = [...prompts, newPrompt];
    storePrompts(updatedPrompts);
    
    return newPrompt;
  },
  
  // 更新提示词
  updatePrompt: async (id, promptData) => {
    await delay(400);
    const prompts = await getStoredPrompts();
    
    // 检查提示词是否存在
    const promptIndex = prompts.findIndex(p => p.id === id);
    if (promptIndex === -1) {
      throw new Error('提示词不存在');
    }
    
    // 更新提示词
    const updatedPrompt = {
      ...prompts[promptIndex],
      ...promptData,
      id, // 保留原ID
      updatedAt: new Date().toISOString()
    };
    
    // 更新列表并保存
    const updatedPrompts = [...prompts];
    updatedPrompts[promptIndex] = updatedPrompt;
    storePrompts(updatedPrompts);
    
    return updatedPrompt;
  },
  
  // 删除提示词
  deletePrompt: async (id) => {
    await delay(300);
    const prompts = await getStoredPrompts();
    
    // 过滤掉要删除的提示词
    const updatedPrompts = prompts.filter(p => p.id !== id);
    
    // 如果长度没变，说明提示词不存在
    if (updatedPrompts.length === prompts.length) {
      throw new Error('提示词不存在');
    }
    
    // 保存更新后的列表
    storePrompts(updatedPrompts);
    
    return { success: true, message: '提示词已删除' };
  }
};

export default mockAPI; 