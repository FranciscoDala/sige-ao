import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import MainLayout from './layouts/MainLayout' // <- NOVO: Layout principal
import Dashboard from './pages/admin/Dashboard'
import { Toaster } from 'sonner'
import { authService } from './services/auth'
import './globals.css'

/**
 * Rota Privada
 * Verifica se o usuário está autenticado antes de liberar a página
 * Se não estiver logado, redireciona para o Login
 * @param children - Componente que será renderizado se estiver autenticado
 */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    return isAuth ? children : <Navigate to="/" replace />
}

/**
 * Rota Pública
 * Só libera a página se o usuário NÃO estiver autenticado
 * Se já estiver logado, manda direto pro Dashboard
 * @param children - Componente que será renderizado se NÃO estiver autenticado
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    return !isAuth ? children : <Navigate to="/dashboard" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
        {/* Toaster global para notificações de sucesso/erro - Sonner */}
        <Toaster position="top-center" richColors />

        {/* Router usando HashRouter por causa do deploy no Render */}
        <HashRouter>
            <Routes>
                {/* Rota pública: Login */}
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                {/* Rota privada: Layout principal com Sidebar + Header */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    {/* Rotas filhas do dashboard */}
                    <Route index element={<Dashboard />} /> {/* /dashboard */}
                    {/* Aqui vamos adicionar as outras depois: escolas, usuarios, etc */}
                    {/* <Route path="escolas" element={<EscolasPage />} /> */}
                </Route>

                {/* Rota coringa: se não achar, volta pro login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    </>
)
