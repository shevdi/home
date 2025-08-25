import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { RoutesList } from './routes'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App>
        <RoutesList />
      </App>
    </React.StrictMode>,
  )
}
