import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Підключаємо Tailwind

// 1. Імпортуємо інструменти Redux
import { Provider } from 'react-redux'
import { store } from './store/index.js' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Обов'язково обгортаємо App у Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)