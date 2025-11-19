import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use environment variable for backend URL, with fallback to proxy path
// The proxy in vite.config.ts will forward /api/copilotkit to the external API

createRoot(document.getElementById('root')!).render(
  <App />,
)