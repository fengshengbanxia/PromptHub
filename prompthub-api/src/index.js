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
      
      // 处理管理员操作
      if (path === 'admin/migrate-tags') {
        // 仅允许POST请求
        if (request.method === 'POST') {
          return await migrateTagsData(env)
        }
      }
      
      // 处理标签相关路由
      if (pathParts[0] === 'tags' || (pathParts[0] === 'api' && pathParts[1] === 'tags')) {
        const isApiPrefix = pathParts[0] === 'api'
        const tagsPathIndex = isApiPrefix ? 1 : 0
        
        // 处理/tags或/api/tags路径
        if (pathParts.length === tagsPathIndex + 1) {
          // 获取所有标签
          if (request.method === 'GET') {
            return await getAllTags(env)
          }
        }
        // 处理/tags/:name或/api/tags/:name路径
        else if (pathParts.length === tagsPathIndex + 2) {
          const tagName = pathParts[tagsPathIndex + 1]
          
          if (request.method === 'GET') {
            return await getTag(tagName, env)
          }
        }
      }
      
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

// 获取所有标签
async function getAllTags(env) {
  // 获取KV中所有标签的键
  const keys = await env.TAGS_KV.list()
  
  // 获取所有标签的值
  const tags = await Promise.all(
    keys.keys.map(async key => {
      const tagJson = await env.TAGS_KV.get(key.name)
      try {
        const tagName = key.name
        const tagData = JSON.parse(tagJson)
        return {
          name: tagName,
          count: tagData.count || 0,
          promptIds: tagData.promptIds || []
        }
      } catch (e) {
        console.error(`解析标签JSON失败 ${key.name}:`, e)
        return null
      }
    })
  )
  
  // 过滤掉解析失败的项
  const validTags = tags.filter(tag => tag !== null)
  
  // 按使用次数排序
  validTags.sort((a, b) => b.count - a.count)
  
  return new Response(JSON.stringify(validTags), {
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(null, env)
    }
  })
}

// 获取单个标签
async function getTag(name, env) {
  const tagJson = await env.TAGS_KV.get(name)
  
  if (tagJson === null) {
    return new Response(JSON.stringify({ error: '标签不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  }
  
  try {
    const tagData = JSON.parse(tagJson)
    return new Response(JSON.stringify({
      name,
      count: tagData.count || 0,
      promptIds: tagData.promptIds || []
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: '解析标签数据失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  }
}

// 更新标签计数和关联
async function updateTagsForPrompt(oldTags, newTags, promptId, env) {
  if (!Array.isArray(oldTags)) oldTags = []
  if (!Array.isArray(newTags)) newTags = []
  
  // 标准化标签 - 转为小写并去除重复项
  const normalizedOldTags = [...new Set(oldTags.map(tag => tag.toLowerCase()))]
  const normalizedNewTags = [...new Set(newTags.map(tag => tag.toLowerCase()))]
  
  // 确定要移除和添加的标签
  const tagsToRemove = normalizedOldTags.filter(tag => !normalizedNewTags.includes(tag))
  const tagsToAdd = normalizedNewTags.filter(tag => !normalizedOldTags.includes(tag))
  
  // 移除标签关联
  for (const tag of tagsToRemove) {
    const tagJson = await env.TAGS_KV.get(tag)
    
    if (tagJson) {
      try {
        const tagData = JSON.parse(tagJson)
        // 移除提示词ID并减少计数
        tagData.promptIds = (tagData.promptIds || []).filter(id => id !== promptId)
        tagData.count = Math.max((tagData.count || 0) - 1, 0)
        
        if (tagData.count > 0) {
          // 更新标签数据
          await env.TAGS_KV.put(tag, JSON.stringify(tagData))
        } else {
          // 如果计数为0，删除标签
          await env.TAGS_KV.delete(tag)
        }
      } catch (e) {
        console.error(`更新标签失败 ${tag}:`, e)
      }
    }
  }
  
  // 添加标签关联
  for (const tag of tagsToAdd) {
    const tagJson = await env.TAGS_KV.get(tag)
    
    let tagData = { count: 1, promptIds: [promptId] }
    
    if (tagJson) {
      try {
        const existingTagData = JSON.parse(tagJson)
        // 添加提示词ID并增加计数
        const existingPromptIds = existingTagData.promptIds || []
        if (!existingPromptIds.includes(promptId)) {
          tagData = {
            count: (existingTagData.count || 0) + 1,
            promptIds: [...existingPromptIds, promptId]
          }
        } else {
          // 已经存在，不做更改
          tagData = existingTagData
        }
      } catch (e) {
        console.error(`解析标签数据失败 ${tag}:`, e)
      }
    }
    
    // 保存标签数据
    await env.TAGS_KV.put(tag, JSON.stringify(tagData))
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
  
  // 更新标签
  await updateTagsForPrompt([], prompt.tags, id, env)
  
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
  
  // 解析现有提示词数据
  let existingPrompt
  try {
    existingPrompt = JSON.parse(existingPromptJson)
  } catch (e) {
    return new Response(JSON.stringify({ error: '解析提示词数据失败' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(request, env)
      }
    })
  }
  
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
  
  // 合并更新数据
  const updatedPrompt = {
    ...existingPrompt,
    title: promptData.title,
    content: promptData.content,
    description: promptData.description || '',
    tags: Array.isArray(promptData.tags) ? promptData.tags : [],
    updatedAt: new Date().toISOString()
  }
  
  // 保存更新后的提示词
  await env.PROMPTS_KV.put(key, JSON.stringify(updatedPrompt))
  
  // 更新标签
  await updateTagsForPrompt(existingPrompt.tags || [], updatedPrompt.tags || [], id, env)
  
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
  const existingPromptJson = await env.PROMPTS_KV.get(key)
  if (existingPromptJson === null) {
    return new Response(JSON.stringify({ error: '提示词不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  }
  
  // 解析提示词数据，获取标签信息
  let existingPrompt
  try {
    existingPrompt = JSON.parse(existingPromptJson)
  } catch (e) {
    console.error(`解析提示词JSON失败 ${key}:`, e)
    existingPrompt = { tags: [] }
  }
  
  // 更新标签计数和关联
  await updateTagsForPrompt(existingPrompt.tags || [], [], id, env)
  
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
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

// 迁移标签数据
async function migrateTagsData(env) {
  try {
    // 获取旧KV中的所有标签
    const oldKeys = await env.PROMPTS_KV.list({ prefix: 'tag_' })
    
    // 迁移计数
    let migratedCount = 0
    let errorCount = 0
    
    // 迁移每个标签
    for (const key of oldKeys.keys) {
      try {
        const oldTagJson = await env.PROMPTS_KV.get(key.name)
        if (oldTagJson) {
          // 提取标签名（去除前缀）
          const tagName = key.name.substring(4)
          
          // 将标签数据存储到新的KV命名空间
          await env.TAGS_KV.put(tagName, oldTagJson)
          migratedCount++
        }
      } catch (e) {
        console.error(`迁移标签失败 ${key.name}:`, e)
        errorCount++
      }
    }
    
    // 返回迁移结果
    return new Response(JSON.stringify({
      success: true,
      message: '标签数据迁移完成',
      stats: {
        total: oldKeys.keys.length,
        migrated: migratedCount,
        errors: errorCount
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '标签数据迁移失败',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(null, env)
      }
    })
  }
} 