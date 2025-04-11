import { useState } from 'react'
import { usePrompts } from '../context/PromptContext'

const TagFilter = ({ tags }) => {
  const { selectedTags, setSelectedTags } = usePrompts()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag))
    } else {
      setSelectedTags(prev => [...prev, tag])
    }
  }
  
  const clearTags = () => {
    setSelectedTags([])
  }
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  
  // 如果没有标签，则不显示过滤器
  if (!tags || tags.length === 0) {
    return null
  }
  
  // 默认显示前5个标签，展开后显示所有
  const displayTags = isExpanded ? tags : tags.slice(0, 5)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          按标签筛选
        </h3>
        
        {selectedTags.length > 0 && (
          <button
            onClick={clearTags}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            清除全部
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2 py-1 text-xs rounded-full ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            } hover:opacity-90 transition-colors`}
          >
            {tag}
          </button>
        ))}
        
        {tags.length > 5 && (
          <button
            onClick={toggleExpand}
            className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            {isExpanded ? '收起' : `显示更多 (${tags.length - 5})`}
          </button>
        )}
      </div>
    </div>
  )
}

export default TagFilter 