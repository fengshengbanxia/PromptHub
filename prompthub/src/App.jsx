import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PromptProvider } from './context/PromptContext'
import Home from './components/Home'
import PromptView from './components/PromptView'

function App() {
  return (
    <PromptProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompt/:id" element={<PromptView />} />
        </Routes>
      </div>
    </PromptProvider>
  )
}

export default App 