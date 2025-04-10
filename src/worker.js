/**
 * PromptHub - Cloudflare Worker
 * 处理API请求，与KV存储交互
 */

// 允许跨域请求的配置
// 手动部署时，将'*'替换为您的Pages域名，例如 'https://prompthub.pages.dev'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 处理OPTIONS请求（CORS预检请求）
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 处理API请求
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // 添加CORS头到所有响应
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders,
  };

  // 处理不同的API路由
  if (path === 'prompts') {
    if (request.method === 'GET') {
      // 获取所有提示词
      const prompts = await listPrompts(env);
      return new Response(JSON.stringify(prompts), { headers });
    } else if (request.method === 'POST') {
      // 添加新提示词
      const data = await request.json();
      if (!data.title || !data.content || !data.tags) {
        return new Response(
          JSON.stringify({ error: '标题、内容和标签都是必填项' }),
          { status: 400, headers }
        );
      }
      
      const id = Date.now().toString();
      const prompt = {
        id,
        title: data.title,
        content: data.content,
        tags: data.tags.split(',').map(tag => tag.trim()),
        createdAt: new Date().toISOString(),
      };
      
      await env.PROMPTS_KV.put(`prompt:${id}`, JSON.stringify(prompt));
      return new Response(JSON.stringify(prompt), { headers });
    }
  } else if (path.startsWith('prompts/')) {
    const id = path.replace('prompts/', '');
    
    if (request.method === 'GET') {
      // 获取特定提示词
      const promptJson = await env.PROMPTS_KV.get(`prompt:${id}`);
      if (!promptJson) {
        return new Response(
          JSON.stringify({ error: '提示词不存在' }),
          { status: 404, headers }
        );
      }
      return new Response(promptJson, { headers });
    } else if (request.method === 'PUT') {
      // 更新提示词
      const existingPromptJson = await env.PROMPTS_KV.get(`prompt:${id}`);
      if (!existingPromptJson) {
        return new Response(
          JSON.stringify({ error: '提示词不存在' }),
          { status: 404, headers }
        );
      }
      
      const existingPrompt = JSON.parse(existingPromptJson);
      const data = await request.json();
      
      const updatedPrompt = {
        ...existingPrompt,
        title: data.title || existingPrompt.title,
        content: data.content || existingPrompt.content,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : existingPrompt.tags,
        updatedAt: new Date().toISOString(),
      };
      
      await env.PROMPTS_KV.put(`prompt:${id}`, JSON.stringify(updatedPrompt));
      return new Response(JSON.stringify(updatedPrompt), { headers });
    } else if (request.method === 'DELETE') {
      // 删除提示词
      await env.PROMPTS_KV.delete(`prompt:${id}`);
      return new Response(JSON.stringify({ success: true }), { headers });
    }
  } else if (path === 'search') {
    // 搜索提示词
    const query = url.searchParams.get('q').toLowerCase();
    const prompts = await listPrompts(env);
    
    const results = prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(query) || 
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    return new Response(JSON.stringify(results), { headers });
  }

  // 如果没有匹配的路由，返回404
  return new Response(
    JSON.stringify({ error: '未找到请求的资源' }),
    { status: 404, headers }
  );
}

// 获取所有提示词
async function listPrompts(env) {
  // 获取所有提示词的列表
  const list = await env.PROMPTS_KV.list({ prefix: 'prompt:' });
  const prompts = [];
  
  for (const key of list.keys) {
    const value = await env.PROMPTS_KV.get(key.name);
    if (value) {
      prompts.push(JSON.parse(value));
    }
  }
  
  return prompts;
}

// 提供静态文件的功能
async function handleStaticRequest(request, env) {
  const url = new URL(request.url);
  let path = url.pathname;
  
  // 处理根路径请求，提供index.html
  if (path === '/' || path === '') {
    path = '/index.html';
  }
  
  try {
    // 从Worker Sites获取静态资源
    const asset = await env.ASSETS.fetch(new Request(url, request));
    return asset;
  } catch (e) {
    return new Response('找不到页面', { status: 404 });
  }
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // 处理API请求
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    
    // 处理静态文件请求
    return handleStaticRequest(request, env);
  }
};
