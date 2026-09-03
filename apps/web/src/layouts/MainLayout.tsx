import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Building2, Settings, LogOut, Search, Bell, Plus, ShieldCheck
} from 'lucide-react'
import { authService } from '../services/auth'

const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
    { icon: Building2, label: 'Gerenciar Escolas', path: '/dashboard/schools' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
]

export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || { nome: 'Super Admin', email: 'admin@sige.ao' }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative overflow-hidden">
            {/* BACKGROUND GLOW */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px]"></div>

            <div className="flex relative z-10">
                {/* SIDEBAR GLASS */}
                <aside className="w-[260px] h-screen sticky top-0 p-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-full flex flex-col">

                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-8 px-2">
                            <ShieldCheck className="w-8 h-8 text-[#3B82F6]" />
                            <h1 className="text-xl font-bold text-white">SIGE</h1>
                            <span className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-md">Admin</span>
                        </div>

                        {/* Menu */}
                        <nav className="space-y-1">
                            {menuItems.map(item => {
                                const isActive = location.pathname === item.path
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive
                                                ? 'bg-white/10 text-white font-semibold border border-white/20'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                )
                            })}
                        </nav>

                        {/* User */}
                        <div className="mt-auto">
                            <div className="bg-white/5 border-white/10 rounded-xl p-3 mb-2">
                                <p className="font-semibold text-sm text-white">{user.nome}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                                <LogOut className="w-5 h-5" /> Sair
                            </button>
                        </div>
                    </div>
                </aside>

                {/* CONTEUDO */}
                <div className="flex-1 p-8">
                    {/* TOPBAR GLASS */}
                    <header className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
                        <div className="relative flex-1 max-w-[500px]">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                placeholder="Buscar escola por nome, código, província..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#3B82F6] text-sm text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"><Bell className="w-5 h-5 text-white" /></button>
                            <button className="flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#3B82F6]/30">
                                <Plus className="w-4 h-4" /> Nova Escola
                            </button>
                        </div>
                    </header>

                    <Outlet />
                </div>
            </div>
        </div>
    )
}
