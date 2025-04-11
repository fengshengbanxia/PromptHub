import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PromptProvider } from './context/PromptContext'
import Home from './components/Home'

function App() {
  // 应用启动时初始化主题
  useEffect(() => {
    // 检查是否有保存的主题设置
    const savedTheme = localStorage.getItem('prompthub-theme')
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // 如果没有保存的设置，根据系统主题设置
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])
  
  return (
    <PromptProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </PromptProvider>
  )
}

export default App 