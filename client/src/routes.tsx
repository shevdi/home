import { BrowserRouter, Routes, Route } from 'react-router'
import { ProjectsPage, WelcomePage, LoginPage, EditWelcomePage, NotFoundPage, EditProjectsPage } from '@/pages'
import { Layout } from '@/app/Layout'
import { PersistLogin } from './features/Auth/PersistLogin'
import RequireAuth from './features/Auth/RequireAuth'

export function RoutesList() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PersistLogin />}>
            <Route index element={<WelcomePage />} />
            <Route path='home'>
              <Route index element={<div>homeage</div>} />
              <Route element={<RequireAuth allowedRoles={['admin']} />}>
                <Route path='edit' element={<EditWelcomePage />} />
              </Route>
            </Route>
            <Route path='projects'>
              <Route index element={<ProjectsPage />} />
              <Route element={<RequireAuth allowedRoles={['admin']} />}>
                <Route path='edit' element={<EditProjectsPage />} />
              </Route>
            </Route>
            <Route path='login'>
              <Route index element={<LoginPage />} />
            </Route>
          </Route>
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
