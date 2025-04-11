import { usePrompts } from '../context/PromptContext'

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = usePrompts()
  
  const handleChange = (e) => {
    setSearchTerm(e.target.value)
  }
  
  const handleClear = () => {
    setSearchTerm('')
  }
  
  return (
    <div className="relative animate-fade-in">
      <input
        type="text"
        placeholder="搜索提示词..."
        value={searchTerm}
        onChange={handleChange}
        className="w-full px-4 py-2.5 pl-10 pr-10 input-field shadow-sm focus:shadow-md transition-all duration-300"
        aria-label="搜索提示词"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          className="w-5 h-5 text-primary-500 dark:text-primary-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label="清除搜索"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      )}
      
      {/* 搜索提示 */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md z-10 overflow-hidden animate-slide-up text-xs">
          <div className="p-2 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <span className="font-medium">搜索提示:</span> 输入标题、内容或标签关键词
          </div>
          {searchTerm.length < 2 ? (
            <div className="p-2 text-gray-500 dark:text-gray-400">
              请输入至少2个字符...
            </div>
          ) : (
            <div className="p-2 text-primary-600 dark:text-primary-400 flex items-center">
              <svg className="w-4 h-4 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              正在搜索 "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar 