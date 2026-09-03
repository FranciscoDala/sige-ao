import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './src/layouts/MainLayout'
import Dashboard from './src/pages/Admin/Dashboard'

const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      // { path: 'schools', element: <SchoolsPage /> },
    ]
  },
  { path: '/login', element: <div>Login Page</div> }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
