import { useState } from 'react'
import { usePrompts } from '../context/PromptContext'
import PromptList from './PromptList'
import PromptDetail from './PromptDetail'
import PromptForm from './PromptForm'
import SearchBar from './SearchBar'
import TagFilter from './TagFilter'

const Home = () => {
  const { 
    prompts, 
    isLoading, 
    selectedPrompt, 
    setSelectedPrompt,
    exportPrompts,
    allTags
  } = usePrompts()
  
  const [isAddingPrompt, setIsAddingPrompt] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [importFile, setImportFile] = useState(null)
  
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
    }
  }
  
  const handleImportClick = async () => {
    if (!importFile) return
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          const { importPrompts } = usePrompts()
          await importPrompts(jsonData)
          alert('导入成功！')
          setImportFile(null)
          // 重置文件输入框
          document.getElementById('import-file').value = ''
        } catch (error) {
          console.error('解析JSON失败:', error)
          alert('导入失败：无效的JSON格式')
        }
      }
      reader.readAsText(importFile)
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败：' + error.message)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左侧面板：搜索、标签过滤和提示词列表 */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">提示词管理</h1>
            
            <div className="mb-4">
              <SearchBar />
            </div>
            
            <div className="mb-4">
              <TagFilter tags={allTags} />
            </div>
            
            <div className="flex justify-between mb-4">
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                添加提示词
              </button>
              
              <div className="relative inline-block">
                <button
                  onClick={() => document.getElementById('options-menu').classList.toggle('hidden')}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded"
                >
                  更多选项
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
                    {importFile && (
                      <button
                        onClick={handleImportClick}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        确认导入: {importFile.name}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                共 {prompts.length} 个提示词
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <PromptList />
            )}
          </div>
        </div>
        
        {/* 右侧面板：详情或表单 */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  选择一个提示词查看详情，或点击"添加提示词"创建新的提示词
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 