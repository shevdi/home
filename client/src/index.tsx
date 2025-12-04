import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/entry/App'
import { RoutesList } from '@/app/routes'

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
