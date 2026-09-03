import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, GraduationCap, Users, Building2, BarChart3,
    Settings, LogOut, Search, Bell, Plus, ChevronDown
} from 'lucide-react'
import { authService } from '../services/auth'

const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
    { icon: Building2, label: 'Escolas', path: '/dashboard/schools' },
    { icon: Users, label: 'Usuários', path: '/dashboard/users' },
    { icon: GraduationCap, label: 'Alunos', path: '/dashboard/students' },
    { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
]

export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || { nome: 'Admin', email: 'admin@sige.ao' }

    return (
        <div className="flex min-h-screen bg-[#0A0A0B] text-gray-200">

            {/* SIDEBAR DARK */}
            <aside className="w-[260px] bg-[#111113] border-r border-[#1F1F22] p-4 flex flex-col">
                {/* Logo SIGE */}
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#00D4AA] to-[#00A884] rounded-lg flex items-center justify-center font-bold text-black">S</div>
                    <h1 className="text-lg font-bold text-white">SIGE</h1>
                </div>

                {/* Menu */}
                <nav className="space-y-1">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-[#00D4AA]/10 text-[#00D4AA] font-semibold' : 'text-gray-400 hover:bg-[#1A1A1D] hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                {/* User + Logout */}
                <div className="mt-auto">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1D] mb-2">
                        <img src="https://i.pravatar.cc/40" className="w-9 h-9 rounded-lg" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-white">{user.nome}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-[#1A1A1D] hover:text-red-400">
                        <LogOut className="w-5 h-5" /> Sair
                    </button>
                </div>
            </aside>

            {/* CONTEUDO */}
            <div className="flex-1 overflow-y-auto">
                {/* TOPBAR */}
                <header className="sticky top-0 z-10 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-[#1F1F22] px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-1 max-w-[500px]">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                placeholder="Pesquisar escolas, alunos, professores..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg focus:outline-none focus:border-[#00D4AA] text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 bg-[#1A1A1D] border-[#2A2A2E] rounded-lg hover:border-[#00D4AA]"><Bell className="w-5 h-5" /></button>
                            <button className="flex items-center gap-2 bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90">
                                <Plus className="w-4 h-4" /> Nova Escola
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
