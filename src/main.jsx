import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Demo from './components/Demo.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <Demo /> */}
  </StrictMode>,
)
