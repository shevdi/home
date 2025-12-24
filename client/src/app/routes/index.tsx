import { BrowserRouter, Routes, Route } from 'react-router'
import {
  ProjectsPage,
  WelcomePage,
  LoginPage,
  EditWelcomePage,
  NotFoundPage,
  EditProjectsPage,
  PhotosPage,
  PhotoPage,
  EditPhotoPage,
  UploadPhotoPage,
} from '@/pages'
import { Layout } from '@/widgets/Layout'
import { PersistLogin, RequireAuth } from '@/features/Auth'

export function RoutesList() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PersistLogin />}>
            <Route index element={<WelcomePage />} />
            <Route path='home'>
              <Route index element={<WelcomePage />} />
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
            <Route path='photos'>
              <Route index element={<PhotosPage />} />
              <Route path=':id'>
                <Route index element={<PhotoPage />} />
                <Route path='edit' element={<EditPhotoPage />} />
              </Route>
              <Route element={<RequireAuth allowedRoles={['admin']} />}>
                <Route path='photo/new' element={<UploadPhotoPage />} />
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
