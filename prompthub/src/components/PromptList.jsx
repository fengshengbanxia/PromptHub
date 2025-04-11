import { usePrompts } from '../context/PromptContext'

const PromptList = () => {
  const { prompts, selectedPrompt, setSelectedPrompt } = usePrompts()

  return (
    <div className="w-full">
      {prompts.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          没有找到提示词，请尝试添加新的提示词或修改搜索条件
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-2">
          {prompts.map(prompt => (
            <div 
              key={prompt.id}
              className={`cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                selectedPrompt && selectedPrompt.id === prompt.id 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                  : ''
              } bg-white dark:bg-gray-800`}
              onClick={() => setSelectedPrompt(prompt)}
            >
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 truncate">
                  {prompt.title}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 h-12 overflow-hidden">
                  {prompt.description || prompt.content.substring(0, 100)}
                </p>
                
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {prompt.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        +{prompt.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(prompt.createdAt).toLocaleDateString()}
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