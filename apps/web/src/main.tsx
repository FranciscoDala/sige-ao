import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import MainLayout from './layouts/MainLayout'
import SchoolsPage from './pages/admin/SchoolsPage' // 👈 renomeia pra ficar igual
import UsersPage from './pages/admin/UsersPage' // 👈 1. IMPORTA A PAGE NOVA
import { Toaster } from 'sonner'
import { authService } from './services/auth'
import './globals.css'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    return isAuth ? children : <Navigate to="/" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuth = authService.isAuthenticated()
    return !isAuth ? children : <Navigate to="/dashboard" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
        <Toaster position="top-center" richColors />

        <HashRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<SchoolsPage />} /> {/* /dashboard - default é escolas */}
                    <Route path="schools" element={<SchoolsPage />} /> {/* /dashboard/schools */}
                    <Route path="users" element={<UsersPage />} /> {/* 👈 2. ADICIONA ESSA LINHA */}
                    <Route path="settings" element={<div>Configurações</div>} /> {/* /dashboard/settings */}
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    </>
)
