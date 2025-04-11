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
    
    // 过滤出数量最多的8个分类
    const topCategories = Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
    
    return {
      total: stats.total,
      categories: topCategories
    }
  }, [prompts])
  
  // 为不同类别分配不同的样式类
  const getCategoryClass = (category) => {
    const categoryMap = {
      '健康': 'bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900 dark:to-success-900',
      '饮食': 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900 dark:to-warning-900',
      '生活': 'bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-900',
      '代码优化': 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-900',
      '开发': 'bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900',
      'AI绘画': 'bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-900 dark:to-primary-900',
      '写作': 'bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
      '技术': 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
    }
    
    return categoryMap[category] || 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        提示词统计
      </h2>
      
      <div className="flex items-center justify-between mb-6 bg-primary-50 dark:bg-primary-900/40 p-4 rounded-xl">
        <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 text-transparent bg-clip-text animate-pulse-slow">
          {categoryStats.total}
        </div>
        <div className="text-gray-700 dark:text-gray-300 font-medium">
          总提示词数量
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Object.entries(categoryStats.categories).map(([category, count], index) => (
          <div 
            key={category}
            className={`rounded-xl ${getCategoryClass(category)} p-4 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 transform hover:translate-y-[-2px] animate-slide-up`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {count}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsBar 