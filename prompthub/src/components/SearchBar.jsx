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
    <div className="relative">
      <input
        type="text"
        placeholder="搜索提示词..."
        value={searchTerm}
        onChange={handleChange}
        className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          className="w-5 h-5 text-gray-400 dark:text-gray-500" 
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
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
    </div>
  )
}

export default SearchBar 