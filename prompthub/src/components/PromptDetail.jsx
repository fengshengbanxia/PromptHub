import { useRef } from 'react'
import { usePrompts } from '../context/PromptContext'

const PromptDetail = ({ prompt, onEditClick, isStandaloneMode = false, onBack }) => {
  const { deletePrompt } = usePrompts()
  const contentRef = useRef(null)
  
  const handleCopy = () => {
    if (contentRef.current) {
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
  
  const handleDelete = () => {
    if (window.confirm(`确定要删除提示词 "${prompt.title}" 吗？`)) {
      deletePrompt(prompt.id)
      if (isStandaloneMode && onBack) {
        onBack() // 如果是独立模式，删除后返回
      }
    }
  }
  
  // 独立模式下处理编辑
  const handleEdit = () => {
    if (isStandaloneMode) {
      // 跳转到主界面并传递编辑状态参数
      window.location.href = `${window.location.origin}?promptId=${prompt.id}&edit=true`
    } else {
      // 非独立模式下使用传入的编辑函数
      onEditClick()
    }
  }
  
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {isStandaloneMode ? (
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="text-xl">←</span>
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {prompt.title}
            </h2>
          </div>
        ) : (
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {prompt.title}
          </h2>
        )}
        
        <div className="flex gap-2">
          <button
            id="copy-button"
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            复制提示词
          </button>
          
          <button
            onClick={handleEdit}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
          >
            编辑
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
  )
}

export default PromptDetail 