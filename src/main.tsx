import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// index.css is replaced by styles/index.css (loaded in App.tsx)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
