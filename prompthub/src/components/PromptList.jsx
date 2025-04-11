import { usePrompts } from '../context/PromptContext'

const PromptList = () => {
  const { prompts, selectedPrompt, setSelectedPrompt } = usePrompts()

  // 根据标签获取卡片样式
  const getCardStyle = (tags) => {
    if (!tags || tags.length === 0) return 'card-gradient-primary';
    
    const tagLowerCase = tags[0].toLowerCase();
    
    if (tagLowerCase.includes('健康') || tagLowerCase.includes('运动')) {
      return 'card-gradient-success';
    } else if (tagLowerCase.includes('饮食') || tagLowerCase.includes('食品')) {
      return 'card-gradient-warning';
    } else if (tagLowerCase.includes('ai') || tagLowerCase.includes('绘画')) {
      return 'card-gradient-secondary';
    } else {
      return 'card-gradient-primary';
    }
  }
  
  // 获取标签相关图标
  const getTagIcon = (tagName) => {
    const iconMap = {
      '健康': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      ),
      '饮食': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      '代码': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      ),
      'AI绘画': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    };
    
    // 根据标签名查找匹配的图标
    for (const [key, icon] of Object.entries(iconMap)) {
      if (tagName.includes(key)) {
        return icon;
      }
    }
    
    // 默认图标
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
      </svg>
    );
  };

  return (
    <div className="w-full">
      {prompts.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <p className="text-lg font-medium mb-2">没有找到提示词</p>
          <p>请尝试添加新的提示词或修改搜索条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[75vh] overflow-y-auto p-3">
          {prompts.map((prompt, index) => (
            <div 
              key={prompt.id}
              className={`cursor-pointer rounded-xl card-hover ${
                selectedPrompt && selectedPrompt.id === prompt.id 
                  ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-hover' 
                  : 'shadow-card'
              } ${getCardStyle(prompt.tags)} animate-slide-up overflow-hidden`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedPrompt(prompt)}
            >
              <div className="p-5 card-content">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {prompt.title}
                    </h3>
                    {prompt.tags && prompt.tags.length > 0 && (
                      <span className="flex items-center justify-center bg-white dark:bg-gray-700 rounded-full w-8 h-8 shadow-sm">
                        {getTagIcon(prompt.tags[0])}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 h-12 overflow-hidden mb-3">
                    {prompt.description || prompt.content.substring(0, 100)}
                  </p>
                </div>
                
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {prompt.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="tag tag-primary inline-flex items-center"
                      >
                        {getTagIcon(tag)}
                        <span className="ml-1">{tag}</span>
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="tag bg-white/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        +{prompt.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-100/70 dark:border-gray-700/30 text-xs text-gray-600 dark:text-gray-400 flex justify-between items-center">
                  <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  {prompt.content && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                      </svg>
                      {prompt.content.length > 150 ? `${prompt.content.length} 字符` : '简短提示词'}
                    </span>
                  )}
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