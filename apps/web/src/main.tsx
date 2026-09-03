import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom' // <- Trocou BrowserRouter por HashRouter
import Login from './pages/auth/Login'
import Dashboard from './pages/admin/Dashboard'
import { Toaster } from 'react-hot-toast'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Toaster position="top-center" />
        <HashRouter> {/* <- MUDOU AQUI */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </HashRouter> {/* <- MUDOU AQUI */}
    </React.StrictMode>,
)
