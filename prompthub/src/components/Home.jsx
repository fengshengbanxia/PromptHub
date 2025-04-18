import { useState, useEffect } from 'react'
import { usePrompts } from '../context/PromptContext'
import PromptList from './PromptList'
import PromptDetail from './PromptDetail'
import PromptForm from './PromptForm'
import SearchBar from './SearchBar'
import TagFilter from './TagFilter'
import StatsBar from './StatsBar'

const Home = () => {
  const { 
    prompts, 
    isLoading, 
    selectedPrompt, 
    setSelectedPrompt,
    exportPrompts,
    importPrompts,
    allTags
  } = usePrompts()
  
  const [isAddingPrompt, setIsAddingPrompt] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // 初始化主题模式
  useEffect(() => {
    // 检查本地存储的主题偏好
    const savedTheme = localStorage.getItem('prompthub-theme')
    
    // 如果有保存的偏好，应用它
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      // 如果没有保存的偏好，检查系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
    }
  }, [])
  
  // 监听主题变化，更新HTML的class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // 保存当前主题到本地存储
    localStorage.setItem('prompthub-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])
  
  // 切换主题
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }
  
  const handleAddClick = () => {
    setSelectedPrompt(null)
    setIsAddingPrompt(true)
    setIsEditing(false)
  }
  
  const handleEditClick = () => {
    setIsAddingPrompt(false)
    setIsEditing(true)
  }
  
  const handleCancelEdit = () => {
    setIsAddingPrompt(false)
    setIsEditing(false)
  }
  
  const handleImportChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImportFile(file)
      // 显示导入模式选择对话框
      setShowImportModal(true)
    }
  }
  
  const handleImportClick = async (replaceAll) => {
    if (!importFile) return
    
    setIsImporting(true)
    setShowImportModal(false)
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          await importPrompts(jsonData, replaceAll)
          alert(replaceAll ? '导入成功！（替换了所有原有提示词）' : '导入成功！（已添加到原有提示词）')
          setImportFile(null)
          // 重置文件输入框
          document.getElementById('import-file').value = ''
        } catch (error) {
          console.error('解析JSON失败:', error)
          alert('导入失败：无效的JSON格式')
        } finally {
          setIsImporting(false)
        }
      }
      reader.readAsText(importFile)
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败：' + error.message)
      setIsImporting(false)
    }
  }
  
  // 关闭导入模式选择对话框
  const closeImportModal = () => {
    setShowImportModal(false)
    setImportFile(null)
    // 重置文件输入框
    document.getElementById('import-file').value = ''
  }
  
  // 切换侧边栏显示
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 导入模式选择对话框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">选择导入模式</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              您要如何导入 {importFile?.name} 中的提示词？
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleImportClick(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                替换所有提示词
              </button>
              <button
                onClick={() => handleImportClick(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                添加到现有提示词
              </button>
              <button
                onClick={closeImportModal}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 顶部统计栏和筛选区域 */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧统计栏 */}
          <div className="lg:col-span-2">
            <StatsBar />
          </div>
          
          {/* 右侧标签筛选 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">按标签筛选</h2>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
                title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
            <TagFilter tags={allTags} />
          </div>
        </div>
      </div>
      
      {/* 提示词管理区域 - 移至页面中央 */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <div className="flex justify-between items-center mb-5 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">提示词管理</h1>
          
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            + 添加提示词
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">搜索提示词</label>
            <SearchBar />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-end items-start">
              <div className="relative inline-block">
                <button
                  onClick={() => document.getElementById('options-menu').classList.toggle('hidden')}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  操作 ▾
                </button>
                <div id="options-menu" className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={exportPrompts}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      导出全部提示词
                    </button>
                    <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      导入提示词
                      <input
                        id="import-file"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportChange}
                      />
                    </label>
                    {isImporting && (
                      <div className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400">
                        <span className="inline-block animate-spin mr-1">↻</span> 导入中...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            显示 {prompts.length} 个提示词
          </p>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 提示词列表区域 */}
        <div className={`${selectedPrompt || isAddingPrompt ? 'lg:w-3/5' : 'w-full'} transition-all duration-300`}>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-l-4 border-blue-500 pl-3">
              提示词列表
            </h2>
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <PromptList />
            )}
          </div>
        </div>
        
        {/* 详情或表单区域 */}
        {(selectedPrompt || isAddingPrompt) && (
          <div className="w-full lg:w-2/5 mt-6 lg:mt-0 transition-all duration-300">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-l-4 border-blue-500 pl-3">
                {isAddingPrompt ? "添加新提示词" : isEditing ? "编辑提示词" : "提示词详情"}
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {isAddingPrompt ? (
                  <PromptForm
                    onCancel={handleCancelEdit}
                    title="添加新提示词"
                  />
                ) : isEditing && selectedPrompt ? (
                  <PromptForm
                    prompt={selectedPrompt}
                    onCancel={handleCancelEdit}
                    title="编辑提示词"
                  />
                ) : selectedPrompt ? (
                  <PromptDetail
                    prompt={selectedPrompt}
                    onEditClick={handleEditClick}
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home 