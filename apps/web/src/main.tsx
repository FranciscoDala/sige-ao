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

// PÁGINAS DO ADMIN - MINISTERIO - TUDO IGUAL
import SchoolsPage from './pages/admin/SchoolsPage'
import UsersPage from './pages/admin/UsersPage'
import AjudaPage from './pages/admin/AjudaPage'

// PÁGINAS DA ESCOLA
import EscolaListPage from './pages/escola/EscolaListPage' // Dashboard da escola
import DefinicoesEscolaPage from './pages/escola/escola_definicoes' // 👈 NOVA

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

                    {/* ========== 2. ROTAS ADMIN - MINISTERIO ==========
                        👇 NADA MUDOU AQUI, TUDO IGUAL
                    */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <AdminLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<SchoolsPage />} />
                        <Route path="escolas/:id" element={<div>Detalhes da Escola</div>} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="ajuda" element={<AjudaPage />} />
                        <Route path="settings" element={<div>Configurações Admin</div>} />
                    </Route>

                    {/* ========== 3. ROTAS ESCOLA - DIRETOR ==========
                        👇 SÓ LIMPEI AQUI
                    */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <SchoolRouteGuard>
                                    <MainLayout />
                                </SchoolRouteGuard>
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<EscolaListPage />} />
                        <Route path="definicoes" element={<DefinicoesEscolaPage />} /> {/* 👈 SÓ ESSA NOVA */}
                    </Route>

                    {/* ROTA 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    </React.StrictMode>
)
