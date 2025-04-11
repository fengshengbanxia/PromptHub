import { usePrompts } from '../context/PromptContext'

const PromptList = () => {
  const { prompts, selectedPrompt, setSelectedPrompt } = usePrompts()

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {prompts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          没有找到提示词，请尝试添加新的提示词或修改搜索条件
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {prompts.map(prompt => (
            <li 
              key={prompt.id}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedPrompt && selectedPrompt.id === prompt.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : ''
              }`}
              onClick={() => setSelectedPrompt(prompt)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {prompt.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {prompt.description || prompt.content.substring(0, 100)}
                </p>
                
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {prompt.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PromptList 