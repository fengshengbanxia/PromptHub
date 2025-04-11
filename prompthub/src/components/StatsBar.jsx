import { useMemo } from 'react'
import { usePrompts } from '../context/PromptContext'

const StatsBar = () => {
  const { prompts, getTagsWithCounts, isLoadingTags } = usePrompts()
  
  // 计算各分类的提示词数量
  const categoryStats = useMemo(() => {
    const stats = {
      total: prompts.length,
      categories: {}
    }
    
    // 获取标签及其计数
    const tagsWithCounts = getTagsWithCounts()
    
    // 将标签计数数据转换为所需格式
    tagsWithCounts.forEach(tag => {
      stats.categories[tag.name] = tag.count
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
  }, [prompts, getTagsWithCounts, isLoadingTags])
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">提示词统计</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {categoryStats.total}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            总提示词数量
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(categoryStats.categories).map(([category, count]) => (
          <div 
            key={category}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex flex-col hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
          >
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              {count}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsBar 