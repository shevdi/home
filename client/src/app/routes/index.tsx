import { BrowserRouter, Routes, Route } from 'react-router'
import {
  WelcomePage,
  LoginPage,
  EditWelcomePage,
  NotFoundPage,
  PhotosPage,
  PhotoPage,
  EditPhotoPage,
  UploadPhotoPage,
} from '@/pages'
import { Layout } from '@/widgets/Layout'
import { PersistLogin, RequireAuth } from '@/features/Auth'
import { YandexMetrika } from '@/shared/analytics/YandexMetrika'

export function RoutesList() {
  return (
    <BrowserRouter>
      <YandexMetrika />
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
            <Route path='photos'>
              <Route index element={<PhotosPage />} />
              <Route path=':id'>
                <Route index element={<PhotoPage />} />
                <Route element={<RequireAuth allowedRoles={['user', 'admin']} />}>
                  <Route path='edit' element={<EditPhotoPage />} />
                </Route>
              </Route>
              <Route path='new' element={<UploadPhotoPage />} />
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
