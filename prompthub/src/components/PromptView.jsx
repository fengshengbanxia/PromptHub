import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePrompts } from '../context/PromptContext'

const PromptView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPromptById, deletePrompt } = usePrompts()
  const [prompt, setPrompt] = useState(null)
  const contentRef = useRef(null)
  
  // 加载提示词
  useEffect(() => {
    if (id) {
      const foundPrompt = getPromptById(id)
      if (foundPrompt) {
        setPrompt(foundPrompt)
      } else {
        // 如果找不到提示词，导航回主页
        navigate('/')
      }
    }
  }, [id, getPromptById, navigate])

  // 复制提示词内容
  const handleCopy = () => {
    if (contentRef.current && prompt) {
      navigator.clipboard.writeText(prompt.content)
        .then(() => {
          // 显示复制成功提示
          const button = document.getElementById('copy-button')
          const originalText = button.innerText
          button.innerText = '已复制!'
          button.classList.add('bg-green-600')
          button.classList.remove('bg-blue-600')
          
          setTimeout(() => {
            button.innerText = originalText
            button.classList.remove('bg-green-600')
            button.classList.add('bg-blue-600')
          }, 2000)
        })
        .catch(err => {
          console.error('复制失败:', err)
          alert('复制失败，请手动复制')
        })
    }
  }
  
  // 删除提示词
  const handleDelete = () => {
    if (prompt && window.confirm(`确定要删除提示词 "${prompt.title}" 吗？`)) {
      deletePrompt(prompt.id)
      navigate('/')
    }
  }
  
  // 返回主页
  const handleBack = () => {
    navigate('/')
  }
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知时间'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {prompt.title}
            </h2>
            
            <div className="flex gap-2">
              <button
                id="copy-button"
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                复制提示词
              </button>
              
              <button
                onClick={handleBack}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
              >
                返回
              </button>
              
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                删除
              </button>
            </div>
          </div>
          
          {prompt.description && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                描述
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{prompt.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              提示词内容
            </h3>
            <div 
              ref={contentRef}
              className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg prompt-content text-gray-800 dark:text-gray-200"
            >
              {prompt.content}
            </div>
          </div>
          
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            创建于: {formatDate(prompt.createdAt)}
            {prompt.updatedAt && prompt.updatedAt !== prompt.createdAt && (
              <span className="ml-4">
                更新于: {formatDate(prompt.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptView 