import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './src/layouts/MainLayout'
import SchoolsPage from './src/pages/Admin/SchoolsPage'
import UsersPage from './src/pages/Admin/UsersPage'
import AjudaPage from './src/pages/Admin/AjudaPage' // 👈 ADD
import Login from './src/pages/auth/Login' // 👈 ADD login real

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      { index: true, element: <SchoolsPage /> }, // /dashboard
      { path: 'schools', element: <SchoolsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'ajuda', element: <AjudaPage /> }, // 👈 ADD
      { path: 'settings', element: <div>Configurações</div> },
    ]
  },
  { path: '*', element: <div>404 - Página não encontrada</div> }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
