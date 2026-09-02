import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login' // <- MUDOU AQUI
import Dashboard from './pages/admin/Dashboard'
import { Toaster } from 'react-hot-toast'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Toaster position="top-center" />
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} /> {/* <- MUDOU AQUI */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
