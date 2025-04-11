import { useMemo } from 'react'
import { usePrompts } from '../context/PromptContext'

const StatsBar = () => {
  const { prompts, allTags } = usePrompts()
  
  // 计算各分类的提示词数量
  const categoryStats = useMemo(() => {
    const stats = {
      total: prompts.length,
      categories: {}
    }
    
    // 初始化常见分类
    const commonCategories = ['健康', '饮食', '生活', '代码优化', '开发', 'AI绘画', '模型']
    commonCategories.forEach(category => {
      stats.categories[category] = 0
    })
    
    // 计算每个标签的提示词数量
    prompts.forEach(prompt => {
      if (prompt.tags && prompt.tags.length > 0) {
        prompt.tags.forEach(tag => {
          if (!stats.categories[tag]) {
            stats.categories[tag] = 1
          } else {
            stats.categories[tag]++
          }
        })
      }
    })
    
    // 过滤出数量最多的12个分类
    const topCategories = Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
    
    return {
      total: stats.total,
      categories: topCategories
    }
  }, [prompts])
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">提示词统计</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {categoryStats.total}
        </div>
        <div className="text-gray-600 dark:text-gray-300">
          总提示词数量
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {Object.entries(categoryStats.categories).map(([category, count]) => (
          <div 
            key={category}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 flex flex-col"
          >
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              {count}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsBar 