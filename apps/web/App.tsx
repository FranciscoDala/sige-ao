import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './src/layouts/MainLayout'
import SchoolsPage from './src/pages/Admin/SchoolsPage' // 👈 renomeado
import UsersPage from './src/pages/Admin/UsersPage' // 👈 nova

const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      { path: 'schools', element: <SchoolsPage /> }, // /dashboard/schools - lista de escolas
      { path: 'users', element: <UsersPage /> }, // /dashboard/users - lista de usuários
      { path: 'settings', element: <div>Configurações</div> }, // /dashboard/settings
    ]
  },
  { path: '/login', element: <div>Login Page</div> }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
