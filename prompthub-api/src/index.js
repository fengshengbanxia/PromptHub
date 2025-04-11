/**
 * PromptHub API - Cloudflare Workers
 * 处理与提示词相关的CRUD操作，使用KV存储数据
 */

// 处理请求的主函数
export default {
  async fetch(request, env, ctx) {
    try {
      // 处理跨域预检请求
      if (request.method === 'OPTIONS') {
        return handleCORS(request, env)
      }
      
      // 解析URL和路径
      const url = new URL(request.url)
      const path = url.pathname.replace(/^\/+/, '').replace(/\/+$/, '')
      const pathParts = path.split('/')
      
      // 修改路由检查，同时支持/api/prompts和/prompts两种路径
      if (pathParts[0] === 'api' && pathParts[1] === 'prompts') {
        // 处理/api/prompts路径
        if (pathParts.length === 2) {
          // 获取所有提示词或创建新提示词
          if (request.method === 'GET') {
            return await getAllPrompts(env)
          } else if (request.method === 'POST') {
            return await createPrompt(request, env)
          }
        } 
        // 处理/api/prompts/:id路径
        else if (pathParts.length === 3) {
          const promptId = pathParts[2]
          
          if (request.method === 'GET') {
            return await getPrompt(promptId, env)
          } else if (request.method === 'PUT') {
            return await updatePrompt(promptId, request, env)
          } else if (request.method === 'DELETE') {
            return await deletePrompt(promptId, env)
          }
        }
      }
      // 直接访问/prompts路径
      else if (pathParts[0] === 'prompts') {
        // 处理/prompts路径
        if (pathParts.length === 1) {
          // 获取所有提示词或创建新提示词
          if (request.method === 'GET') {
            return await getAllPrompts(env)
          } else if (request.method === 'POST') {
            return await createPrompt(request, env)
          }
        } 
        // 处理/prompts/:id路径
        else if (pathParts.length === 2) {
          const promptId = pathParts[1]
          
          if (request.method === 'GET') {
            return await getPrompt(promptId, env)
          } else if (request.method === 'PUT') {
            return await updatePrompt(promptId, request, env)
          } else if (request.method === 'DELETE') {
            return await deletePrompt(promptId, env)
          }
        }
      }
      
      // 如果没有匹配的路由
      return new Response('Not Found', { 
        status: 404,
        headers: getCORSHeaders(request, env)
      })
      
    } catch (error) {
      console.error('API错误:', error)
      
      return new Response(JSON.stringify({ 
        error: '服务器错误', 
        message: error.message 
      }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders(request, env)
        }
      })
    }
  }
}

// 获取所有提示词
async function getAllPrompts(env) {
  // 获取KV中所有提示词的键
  const keys = await env.PROMPTS_KV.list({ prefix: 'prompt_' })
  
  // 获取所有提示词的值
  const prompts = await Promise.all(
    keys.keys.map(async key => {
      const promptJson = await env.PROMPTS_KV.get(key.name)
      try {
        return JSON.parse(promptJson)
      } catch (e) {
        console.error(`解析提示词JSON失败 ${key.name}:`, e)
        return null
      }
    })
  )
  
  // 过滤掉解析失败的项
  const validPrompts = prompts.filter(prompt => prompt !== null)
  
  return new Response(JSON.stringify(validPrompts), {
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(null, env)
    }
  })
}

// 获取单个提示词
async function getPrompt(id, env) {
  const key = `prompt_${id}`
  const promptJson = await env.PROMPTS_KV.get(key)
  
  if (promptJson === null) {
    return new Response(JSON.stringify({ error: '提示词不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  }
  
  return new Response(promptJson, {
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(null, env)
    }
  })
}

// 创建新提示词
async function createPrompt(request, env) {
  const contentType = request.headers.get('Content-Type') || ''
  
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: '仅支持JSON格式' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(request, env)
      }
    })
  }
  
  const promptData = await request.json()
  
  // 验证必填字段
  if (!promptData.title || !promptData.content) {
    return new Response(JSON.stringify({ error: '标题和内容不能为空' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(request, env)
      }
    })
  }
  
  // 创建唯一ID
  const id = crypto.randomUUID()
  
  // 格式化提示词数据
  const prompt = {
    id,
    title: promptData.title,
    content: promptData.content,
    description: promptData.description || '',
    tags: Array.isArray(promptData.tags) ? promptData.tags : [],
    createdAt: promptData.createdAt || new Date().toISOString(),
  }
  
  // 保存到KV
  await env.PROMPTS_KV.put(`prompt_${id}`, JSON.stringify(prompt))
  
  return new Response(JSON.stringify(prompt), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(request, env)
    }
  })
}

// 更新提示词
async function updatePrompt(id, request, env) {
  const key = `prompt_${id}`
  
  // 检查提示词是否存在
  const existingPromptJson = await env.PROMPTS_KV.get(key)
  if (existingPromptJson === null) {
    return new Response(JSON.stringify({ error: '提示词不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(request, env)
      }
    })
  }
  
  const existingPrompt = JSON.parse(existingPromptJson)
  const updatedData = await request.json()
  
  // 验证必填字段
  if (!updatedData.title || !updatedData.content) {
    return new Response(JSON.stringify({ error: '标题和内容不能为空' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(request, env)
      }
    })
  }
  
  // 更新提示词数据
  const updatedPrompt = {
    ...existingPrompt,
    title: updatedData.title,
    content: updatedData.content,
    description: updatedData.description || existingPrompt.description || '',
    tags: Array.isArray(updatedData.tags) ? updatedData.tags : (existingPrompt.tags || []),
    updatedAt: updatedData.updatedAt || new Date().toISOString()
  }
  
  // 保存到KV
  await env.PROMPTS_KV.put(key, JSON.stringify(updatedPrompt))
  
  return new Response(JSON.stringify(updatedPrompt), {
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(request, env)
    }
  })
}

// 删除提示词
async function deletePrompt(id, env) {
  const key = `prompt_${id}`
  
  // 检查提示词是否存在
  const existingPrompt = await env.PROMPTS_KV.get(key)
  if (existingPrompt === null) {
    return new Response(JSON.stringify({ error: '提示词不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  }
  
  // 从KV中删除
  await env.PROMPTS_KV.delete(key)
  
  return new Response(JSON.stringify({ success: true, message: '提示词已删除' }), {
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(null, env)
    }
  })
}

// 处理CORS预检请求
function handleCORS(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(request, env)
  })
}

// 获取CORS响应头
function getCORSHeaders(request, env) {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
  const origin = request?.headers.get('Origin') || ''
  
  // 允许的源，如果配置了*或者在允许列表中
  const allowOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0]
    
  return {
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
} 