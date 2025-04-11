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
    allTags,
    getPromptById
  } = usePrompts()
  
  const [isAddingPrompt, setIsAddingPrompt] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isDetailMode, setIsDetailMode] = useState(false)
  
  // 从URL参数中读取promptId
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const promptId = urlParams.get('promptId')
    
    if (promptId) {
      const prompt = getPromptById(promptId)
      if (prompt) {
        setSelectedPrompt(prompt)
        setIsDetailMode(true) // 设置为详情页模式
      }
    }
  }, [prompts, getPromptById])
  
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
  
  // 返回到主页
  const handleBackToHome = () => {
    window.close() // 关闭当前标签页
    // 如果是从主页直接打开的，可以通过以下方式返回主页
    // window.location.href = window.location.origin
  }
  
  // 如果是详情页模式，只显示提示词详情
  if (isDetailMode && selectedPrompt) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <PromptDetail
            prompt={selectedPrompt}
            onEditClick={handleEditClick}
            isStandaloneMode={true}
            onBack={handleBackToHome}
          />
        </div>
      </div>
    )
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
      
      {/* 顶部统计栏 */}
      <div className="mb-6">
        <StatsBar />
      </div>
      
      {/* 主内容区 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 侧边栏控制按钮（仅在移动设备上显示） */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={toggleSidebar}
            className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
          >
            {showSidebar ? '隐藏筛选' : '显示筛选'}
          </button>
        </div>
        
        {/* 侧边栏：筛选和操作 */}
        {(showSidebar || window.innerWidth >= 1024) && (
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">提示词管理</h1>
                
                <button
                  onClick={handleAddClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm"
                >
                  + 添加提示词
                </button>
              </div>
              
              <div className="mb-4">
                <SearchBar />
              </div>
              
              <div className="mb-4">
                <TagFilter tags={allTags} />
              </div>
              
              <div className="flex justify-end">
                <div className="relative inline-block">
                  <button
                    onClick={() => document.getElementById('options-menu').classList.toggle('hidden')}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg"
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
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  显示 {prompts.length} 个提示词
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 主要内容区域 */}
        <div className="flex-grow">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 提示词列表区域 */}
            <div className={`${selectedPrompt || isAddingPrompt ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <PromptList />
              )}
            </div>
            
            {/* 详情或表单区域 */}
            {(selectedPrompt || isAddingPrompt) && (
              <div className="w-full lg:w-1/2">
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 