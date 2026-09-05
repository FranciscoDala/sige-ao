import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import MainLayout from './layouts/MainLayout'
import SchoolsPage from './pages/admin/SchoolsPage'
import UsersPage from './pages/admin/UsersPage'
import AjudaPage from './pages/admin/AjudaPage' // 👈 ADD
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
                    <Route index element={<SchoolsPage />} />
                    <Route path="schools" element={<SchoolsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="ajuda" element={<AjudaPage />} /> {/* 👈 ADD */}
                    <Route path="settings" element={<div>Configurações</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    </>
)
