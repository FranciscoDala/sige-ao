import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { authService } from './services/auth'
import './globals.css'

// ======================= LAYOUTS =======================
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

// ======================= PAGES =======================
import Login from './pages/auth/Login'
import SchoolsPage from './pages/admin/SchoolsPage'
import UsersPage from './pages/admin/UsersPage'
import AjudaPage from './pages/admin/AjudaPage'
import EscolaListPage from './pages/escola/EscolaListPage'
import DefinicoesEscolaPage from './pages/escola/escola_definicoes'
import DirecaoPage from './pages/escola/escola_direcao'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
})

// 👇 Aplica o tema salvo no localStorage
const applySavedTheme = () => {
    const t = localStorage.getItem('escola_tema')
    if (!t) return
    try {
        const tema = JSON.parse(t)
        const root = document.documentElement
        root.style.setProperty('--cor-primaria', tema.cor_primaria || '#3B82F6')
        root.style.setProperty('--cor-secundaria', tema.cor_secundaria || '#8B5CF6')
        root.style.setProperty('--cor-fundo', tema.cor_fundo || '#FFFFFF')
        root.setAttribute('data-tema', tema.tema || 'escuro')
        root.setAttribute('data-card-style', tema.estilo_card || 'arredondado')
        root.setAttribute('data-fonte-titulo', tema.fonte_titulo || 'Poppins')
        root.setAttribute('data-fonte-corpo', tema.fonte_corpo || 'Inter')
    } catch (e) {
        console.error("Erro ao aplicar tema salvo", e)
    }
}

// 👇 Componente pra escutar mudança de tema sem F5
const ThemeListener = () => {
    useEffect(() => {
        applySavedTheme()

        const handleTemaUpdated = () => applySavedTheme()
        window.addEventListener('escola-tema-updated', handleTemaUpdated)

        return () => window.removeEventListener('escola-tema-updated', handleTemaUpdated)
    }, [])
    return null
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    return isAuth ? children : <Navigate to="/" replace />
}

const SchoolRouteGuard = ({ children }: { children: React.ReactNode }) => {
    const nivel = authService.getNivel()?.toUpperCase()
    if (nivel === 'MINISTERIO') return <Navigate to="/admin" replace />
    return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    const nivel = authService.getNivel()?.toUpperCase()
    if (!isAuth) return children
    if (nivel === 'MINISTERIO') return <Navigate to="/admin" replace />
    return <Navigate to="/dashboard" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-center" richColors />
            <ThemeListener />
            <HashRouter>
                <Routes>
                    <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

                    <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                        <Route index element={<SchoolsPage />} />
                        <Route path="escolas/:id" element={<div>Detalhes da Escola</div>} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="ajuda" element={<AjudaPage />} />
                        <Route path="settings" element={<div>Configurações Admin</div>} />
                    </Route>

                    <Route path="/dashboard" element={<PrivateRoute><SchoolRouteGuard><MainLayout /></SchoolRouteGuard></PrivateRoute>}>
                        <Route index element={<EscolaListPage />} />
                        <Route path="definicoes" element={<DefinicoesEscolaPage />} />
                        <Route path="direcao" element={<DirecaoPage />} /> {/* 👈 ROTA NOVA */}
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    </React.StrictMode>
)
