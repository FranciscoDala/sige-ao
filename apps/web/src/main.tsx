import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { authService } from './services/auth'
import './globals.css'

// LAYOUTS
import MainLayout from './layouts/MainLayout' // Layout do painel da escola
import AdminLayout from './layouts/AdminLayout' // 👈 Cria esse layout pra MINISTERIO

// PAGES
import Login from './pages/auth/Login'
import EscolaListPage from './pages/escola/EscolaListPage'
import UsersPage from './pages/admin/UsersPage'
import AjudaPage from './pages/admin/AjudaPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// Bloqueia se não estiver logado
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    return isAuth ? children : <Navigate to="/" replace />
}

// Bloqueia se já estiver logado
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    const user = authService.getUser()

    if (!isAuth) return children

    // Se já logado, manda pro painel certo
    if (user?.nivel === 'MINISTERIO') return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-center" richColors />

            <HashRouter>
                <Routes>
                    {/* ROTA PÚBLICA */}
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* ROTAS ADMIN - MINISTERIO */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <AdminLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<EscolaListPage />} /> {/* /admin = Lista de Escolas */}
                        <Route path="escolas/:id" element={<div>Detalhes da Escola</div>} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="ajuda" element={<AjudaPage />} />
                        <Route path="settings" element={<div>Configurações Admin</div>} />
                    </Route>

                    {/* ROTAS ESCOLA - DIRETOR, SECRETARIO, etc */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <MainLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<div>Bem-vindo ao painel da escola</div>} /> {/* 👈 Dashboard da escola */}
                        <Route path="alunos" element={<div>Alunos</div>} />
                        <Route path="turmas" element={<div>Turmas</div>} />
                        <Route path="ajuda" element={<AjudaPage />} />
                        <Route path="settings" element={<div>Configurações Escola</div>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    </React.StrictMode>
)
