import { BrowserRouter, Routes, Route } from 'react-router'
import { ProjectsPage, WelcomePage, LoginPage } from '@/pages'
import { Layout } from '@/app/Layout'

export function RoutesList() {
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
          <Route path='login'>
            <Route index element={<LoginPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
