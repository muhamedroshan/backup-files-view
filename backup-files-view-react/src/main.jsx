import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BackupTimeline from './backup-files-view/BackupFilesView.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BackupTimeline />
  </StrictMode>,
)
