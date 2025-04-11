import { useState, useEffect } from 'react'
import { usePrompts } from '../context/PromptContext'

const PromptForm = ({ prompt, onCancel, title = '编辑提示词' }) => {
  const { addPrompt, updatePrompt, allTags } = usePrompts()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  // 初始化表单数据
  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title || '',
        content: prompt.content || '',
        description: prompt.description || '',
        tags: prompt.tags || []
      })
    }
  }, [prompt])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value)
  }
  
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault() // 防止表单提交
      addTag(tagInput.trim())
    }
  }
  
  const addTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag && !formData.tags.includes(normalizedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, normalizedTag]
      }))
    }
    setTagInput('')
  }
  
  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空'
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '提示词内容不能为空'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (prompt) {
        // 更新现有提示词
        await updatePrompt(prompt.id, formData)
      } else {
        // 创建新提示词
        await addPrompt(formData)
      }
      
      onCancel() // 关闭表单
    } catch (error) {
      console.error('保存提示词失败:', error)
      alert('保存失败: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {title}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.title 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } focus:border-transparent focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white`}
            placeholder="提示词标题"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="content" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            提示词内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.content 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } focus:border-transparent focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white`}
            placeholder="输入提示词内容..."
          ></textarea>
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            描述
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="简要描述这个提示词的用途..."
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label 
            htmlFor="tagInput" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            标签
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              className="flex-grow px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="添加标签并按回车"
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={!tagInput.trim()}
            >
              添加
            </button>
          </div>
          
          {allTags.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">常用标签:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {formData.tags.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存提示词'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PromptForm 