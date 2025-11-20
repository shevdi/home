import { BrowserRouter, Routes, Route } from 'react-router'
import { ProjectsPage, WelcomePage, LoginPage, EditWelcomePage } from '@/pages'
import { Layout } from '@/app/Layout'
import { PersistLogin } from './features/Auth/PersistLogin'

export function RoutesList() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PersistLogin />}>
            <Route index element={<WelcomePage />} />
            <Route path='home'>
              <Route index element={<div>homeage</div>} />
              <Route path='edit' element={<EditWelcomePage />} />
            </Route>
            <Route path='projects'>
              <Route index element={<ProjectsPage />} />
            </Route>
            <Route path='login'>
              <Route index element={<LoginPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
