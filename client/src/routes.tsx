import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ProjectsPage, WelcomePage } from '@/pages'
import { Layout } from '@/app/Layout'

export default () => {
  return (
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
  )
}
