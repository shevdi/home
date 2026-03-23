import '@shevdi-home/ui-kit/style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/entry/App'
import { RoutesList } from '@/app/routes'
import { hydrateAuth } from '@/app/bootstrap'

const rootElement = document.getElementById('root')
if (rootElement) {
  hydrateAuth().then(() => {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App>
          <RoutesList />
        </App>
      </React.StrictMode>,
    )
  })
}
