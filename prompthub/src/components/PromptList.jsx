import { usePrompts } from '../context/PromptContext'

const PromptList = () => {
  const { prompts, selectedPrompt, setSelectedPrompt } = usePrompts()

  return (
    <div className="w-full">
      {prompts.length === 0 ? (
        <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            没有找到提示词，请尝试添加新的提示词或修改搜索条件
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[75vh] overflow-y-auto p-2">
          {prompts.map(prompt => (
            <div 
              key={prompt.id}
              className={`cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 ${
                selectedPrompt && selectedPrompt.id === prompt.id 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-[1.02]' 
                  : ''
              } bg-white dark:bg-gray-800`}
              onClick={() => setSelectedPrompt(prompt)}
            >
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 truncate">
                  {prompt.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 h-12 line-clamp-2 mb-3">
                  {prompt.description || prompt.content.substring(0, 100)}
                </p>
                
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {prompt.tags.slice(0, 5).map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {prompt.tags.length > 5 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        +{prompt.tags.length - 5}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-blue-500 dark:text-blue-400">
                    点击查看详情
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PromptList 