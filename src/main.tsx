import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle unhandled promise rejections (like AbortError from hot reload)
window.addEventListener('unhandledrejection', (event) => {
  // Ignore AbortError - it's usually from hot reload or request cancellation
  if (
    event.reason?.name === 'AbortError' ||
    event.reason?.message?.includes('aborted') ||
    event.reason?.message?.includes('AbortError')
  ) {
    console.warn('⚠️ Unhandled AbortError (likely from hot reload) - ignoring')
    event.preventDefault() // Prevent it from showing as an error
    return
  }
  
  // Log other unhandled rejections for debugging
  console.error('Unhandled promise rejection:', event.reason)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
