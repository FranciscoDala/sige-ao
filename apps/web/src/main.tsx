import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App' // Login
import Dashboard from './pages/Dashboard'
import { Toaster } from 'react-hot-toast'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Toaster position="top-center" />
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
