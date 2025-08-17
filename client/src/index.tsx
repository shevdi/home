import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ProjectsPage, WelcomePage } from '@/pages'
import { Layout } from '@/app/Layout'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<WelcomePage />} />
              <Route path='home'>
                <Route index element={<div>homeage</div>} />
              </Route>
              <Route path='projects'>
                <Route index element={<ProjectsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </App>
    </React.StrictMode>,
  )
}
