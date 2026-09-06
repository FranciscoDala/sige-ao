import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { authService } from './services/auth'
import './globals.css'

// ======================= LAYOUTS =======================
// Layout do painel da escola: Diretor, Secretario, Professor
import MainLayout from './layouts/MainLayout'
// Layout do MINISTERIO: Admin geral
import AdminLayout from './layouts/AdminLayout'

// ======================= PAGES =======================
// PÁGINAS GERAIS
import Login from './pages/auth/Login'

// PÁGINAS DO ADMIN - MINISTERIO
import SchoolsPage from './pages/admin/SchoolsPage' // 👈 FALTAVA ESSE IMPORT
import UsersPage from './pages/admin/UsersPage'
import AjudaPage from './pages/admin/AjudaPage'

// PÁGINAS DA ESCOLA
import EscolaListPage from './pages/escola/EscolaListPage' // Dashboard da escola

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

// Bloqueia rota de escola se for MINISTERIO
const SchoolRouteGuard = ({ children }: { children: React.ReactNode }) => {
    const nivel = authService.getNivel()?.toUpperCase()
    if (nivel === 'MINISTERIO') return <Navigate to="/admin" replace />
    return <>{children}</>
}

// Bloqueia se já estiver logado
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    const nivel = authService.getNivel()?.toUpperCase()

    if (!isAuth) return children

    // Redireciona baseado no nível
    if (nivel === 'MINISTERIO') return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-center" richColors />

            <HashRouter>
                <Routes>
                    {/* ========== 1. ROTA PÚBLICA ========== */}
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* ========== 2. ROTAS ADMIN - MINISTERIO ========== */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <AdminLayout />
                            </PrivateRoute>
                        }
                    >
                        {/* Dashboard do Admin */}
                        <Route index element={<SchoolsPage />} /> {/* 👈 TROQUEI AQUI */}

                        <Route path="escolas/:id" element={<div>Detalhes da Escola</div>} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="ajuda" element={<AjudaPage />} />
                        <Route path="settings" element={<div>Configurações Admin</div>} />
                    </Route>

                    {/* ========== 3. ROTAS ESCOLA - DIRETOR, SECRETARIO, etc ========== */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <SchoolRouteGuard> {/* TRANCADO: MINISTERIO não entra aqui */}
                                    <MainLayout />
                                </SchoolRouteGuard>
                            </PrivateRoute>
                        }
                    >
                        {/* Dashboard da Escola */}
                        <Route index element={<EscolaListPage />} /> {/* 👈 AGORA É DA ESCOLA */}

                        <Route path="alunos" element={<div>Alunos</div>} />
                        <Route path="turmas" element={<div>Turmas</div>} />
                        <Route path="disciplinas" element={<div>Disciplinas</div>} />
                        <Route path="notas" element={<div>Notas</div>} />
                        <Route path="frequencia" element={<div>Frequência</div>} />
                        <Route path="financeiro" element={<div>Financeiro</div>} />
                        <Route path="matriculas" element={<div>Matrículas</div>} />
                        <Route path="ajuda" element={<AjudaPage />} />
                        <Route path="settings" element={<div>Configurações Escola</div>} />
                    </Route>

                    {/* ROTA 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    </React.StrictMode>
)
