import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/admin/Dashboard'
import { Toaster } from 'react-hot-toast'
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
    // StrictMode desativado temporariamente por causa do bug do react-hot-toast + DevTools
    // <React.StrictMode>
        <>
            {/* Toaster global para notificações de sucesso/erro */}
            <Toaster position="top-center" />

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

                    {/* Rota privada: Dashboard Admin */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Rota coringa: se não achar, volta pro login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </>
    // </React.StrictMode>,
)
