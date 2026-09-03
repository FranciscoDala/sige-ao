import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/admin/Dashboard'
import { Toaster } from 'react-hot-toast'
import { authService } from './services/auth'
import './globals.css'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => { // <- MUDOU
    return authService.isAuthenticated() ? children : <Navigate to="/" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => { // <- MUDOU
    return !authService.isAuthenticated() ? children : <Navigate to="/dashboard" replace />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Toaster position="top-center" />
        <HashRouter>
            <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    </React.StrictMode>,
)
