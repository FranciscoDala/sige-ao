import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutGrid, Users, Briefcase, UserCheck, FileText,
    Settings, Bell, Calendar, Download
} from 'lucide-react'
import { authService } from '../services/auth'

const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Usuários', path: '/dashboard/usuarios' },
    { icon: Briefcase, label: 'Escolas', path: '/dashboard/escolas' },
    { icon: UserCheck, label: 'Candidatos', path: '/dashboard/candidatos' },
    { icon: FileText, label: 'Relatórios', path: '/dashboard/relatorios' },
]

// Função pra traduzir o nivel
const traduzirNivel = (nivel: string) => {
    const mapa: any = {
        'super_admin': 'Super Administrador',
        'admin_escola': 'Admin Escola',
        'diretor': 'Diretor',
        'secretario': 'Secretário',
        'professor': 'Professor',
    }
    return mapa[nivel] || 'Usuário'
}

export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || { nome: 'Usuário', nivel: 'admin' }

    return (
        <div className="min-h-screen bg-[#F7F5F1]">

            {/* HEADER VERDE ESCURO */}
            <header className="bg-[#0B4D3F] text-white">
                {/* Top Nav */}
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] rounded-lg"></div>
                        <h1 className="text-xl font-bold">SIGE-AO</h1>
                    </div>

                    {/* Menu Central */}
                    <nav className="flex items-center gap-2 bg-white/10 p-1 rounded-full">
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${isActive ? 'bg-white text-[#0B4D3F] font-semibold' : 'text-white/80 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Lado Direito */}
                    <div className="flex items-center gap-4">
                        <button className="text-white/80 hover:text-white"><Settings className="w-5 h-5" /></button>
                        <button className="text-white/80 hover:text-white"><Bell className="w-5 h-5" /></button>
                        <div className="flex items-center gap-3">
                            <img src="https://i.pravatar.cc/40" alt="avatar" className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-sm">{user.nome}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner Saudação */}
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <p className="text-white/70">Bom dia,</p>
                        <h2 className="text-3xl font-bold">{user.nome}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                            <Calendar className="w-4 h-4" /> 2026
                        </button>
                        <button className="bg-white text-[#0B4D3F] font-semibold px-5 py-2 rounded-full flex items-center gap-2">
                            <Download className="w-4 h-4" /> Exportar Dados
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO */}
            <main className="p-8">
                <Outlet />
            </main>
        </div>
    )
}
