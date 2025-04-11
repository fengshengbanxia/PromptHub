import { createContext, useState, useEffect, useContext, useMemo } from 'react'
import * as promptAPI from '../api/promptApi'

const PromptContext = createContext()

export const usePrompts = () => useContext(PromptContext)

export const PromptProvider = ({ children }) => {
  const [prompts, setPrompts] = useState([])
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTags, setIsLoadingTags] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  // 加载所有提示词
  const loadPrompts = async () => {
    setIsLoading(true)
    try {
      const data = await promptAPI.getAllPrompts()
      setPrompts(data)
    } catch (error) {
      console.error('加载提示词失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 加载所有标签
  const loadTags = async () => {
    setIsLoadingTags(true)
    try {
      const data = await promptAPI.getAllTags()
      setTags(data)
    } catch (error) {
      console.error('加载标签失败:', error)
    } finally {
      setIsLoadingTags(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadPrompts()
    loadTags()
  }, [])

  // 添加新提示词
  const addPrompt = async (newPrompt) => {
    try {
      const savedPrompt = await promptAPI.createPrompt(newPrompt)
      setPrompts(prev => [...prev, savedPrompt])
      // 重新加载标签数据
      loadTags()
      return savedPrompt
    } catch (error) {
      console.error('添加提示词失败:', error)
      throw error
    }
  }

  // 更新提示词
  const updatePrompt = async (id, updatedPrompt) => {
    try {
      const result = await promptAPI.updatePrompt(id, updatedPrompt)
      setPrompts(prev => 
        prev.map(prompt => prompt.id === id ? result : prompt)
      )
      if (selectedPrompt && selectedPrompt.id === id) {
        setSelectedPrompt(result)
      }
      // 重新加载标签数据
      loadTags()
      return result
    } catch (error) {
      console.error('更新提示词失败:', error)
      throw error
    }
  }

  // 删除提示词
  const deletePrompt = async (id) => {
    try {
      await promptAPI.deletePrompt(id)
      setPrompts(prev => prev.filter(prompt => prompt.id !== id))
      if (selectedPrompt && selectedPrompt.id === id) {
        setSelectedPrompt(null)
      }
      // 重新加载标签数据
      loadTags()
    } catch (error) {
      console.error('删除提示词失败:', error)
      throw error
    }
  }

  // 过滤提示词
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => prompt.tags.includes(tag))
    
    return matchesSearch && matchesTags
  })

  // 获取所有标签
  const allTags = useMemo(() => {
    // 如果API标签加载完成，使用API标签数据
    if (!isLoadingTags && tags.length > 0) {
      return tags.map(tag => tag.name)
    }
    
    // 否则从提示词中提取标签
    return [...new Set(prompts.flatMap(prompt => prompt.tags || []))]
  }, [prompts, tags, isLoadingTags])

  // 按使用次数获取标签
  const getTagsWithCounts = () => {
    // 如果API标签加载完成，使用API标签数据
    if (!isLoadingTags && tags.length > 0) {
      return tags.map(tag => ({
        name: tag.name,
        count: tag.count
      }))
    }
    
    // 否则从提示词中统计标签
    const tagCounts = {}
    prompts.forEach(prompt => {
      if (prompt.tags && prompt.tags.length > 0) {
        prompt.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = 1
          } else {
            tagCounts[tag]++
          }
        })
      }
    })
    
    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
  }

  // 导出提示词数据为JSON
  const exportPrompts = () => {
    const dataStr = JSON.stringify(prompts, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `prompthub-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 导入提示词数据
  const importPrompts = async (jsonData, replaceAll = true) => {
    try {
      // 清空现有数据
      if (replaceAll) {
        for (const prompt of prompts) {
          await promptAPI.deletePrompt(prompt.id)
        }
      }
      
      // 导入新数据
      const importedPrompts = []
      for (const prompt of jsonData) {
        const { id, ...promptData } = prompt // 移除旧id
        const savedPrompt = await promptAPI.createPrompt(promptData)
        importedPrompts.push(savedPrompt)
      }
      
      // 更新本地数据
      if (replaceAll) {
        setPrompts(importedPrompts)
      } else {
        setPrompts(prev => [...prev, ...importedPrompts])
      }
      
      // 重新加载标签数据
      loadTags()
      
      return importedPrompts
    } catch (error) {
      console.error('导入提示词失败:', error)
      throw error
    }
  }

  return (
    <PromptContext.Provider value={{
      prompts: filteredPrompts,
      isLoading,
      selectedPrompt,
      setSelectedPrompt,
      searchTerm,
      setSearchTerm,
      selectedTags,
      setSelectedTags,
      allTags,
      tags, 
      isLoadingTags,
      getTagsWithCounts,
      addPrompt,
      updatePrompt,
      deletePrompt,
      exportPrompts,
      importPrompts,
    }}>
      {children}
    </PromptContext.Provider>
  )
} 