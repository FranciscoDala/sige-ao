import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutGrid, School, Users, FileText, Clock, Trash2, Star,
    Cloud, Bell, HelpCircle, Settings, Search, Menu, Upload,
    School as SchoolIcon
} from 'lucide-react'
import { authService } from '../services/auth'

const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: School, label: 'Escolas', path: '/dashboard/escolas' },
    { icon: Users, label: 'Usuários', path: '/dashboard/usuarios' },
    { icon: FileText, label: 'Relatórios', path: '/dashboard/relatorios' },
    { icon: Clock, label: 'Recentes', path: '/dashboard/recentes' },
    { icon: Trash2, label: 'Lixeira', path: '/dashboard/lixeira' },
    { icon: Star, label: 'Favoritos', path: '/dashboard/favoritos' },
]

export default function MainLayout() {
    const [search, setSearch] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser()

    const handleLogout = () => {
        authService.logout()
        navigate('/', { replace: true })
    }

    return (
        <div className="h-screen w-screen flex bg-[#F5F7FA] overflow-hidden">

            {/* SIDEBAR AZUL COM BORDER-RADIUS-TOP-RIGHT */}
            <aside
                className="w-64 bg-gradient-to-b from-[#1E40AF] to-[#1E3A8A] text-white flex-col shadow-2xl"
                style={{ borderTopRightRadius: '32px' }} // <- AQUI: só a curva de cima da direita
            >

                {/* Logo SIGE-AO em branco */}
                <div className="p-6 flex items-center gap-3">
                    <SchoolIcon className="w-8 h-8 flex-shrink-0" />
                    <h1 className="text-xl font-bold">SIGE-AO</h1>
                </div>

                {/* Botão Upload branco */}
                <div className="px-4 mb-6">
                    <button className="w-full bg-white text-[#1E40AF] font-bold py-2.5 rounded-full hover:scale-105 transition flex items-center justify-center gap-2 shadow-lg">
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 space-y-1">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive
                                        ? 'bg-white/20 font-semibold'
                                        : 'hover:bg-white/10'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* STORAGE */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Cloud className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-wider">STORAGE</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div className="bg-[#FFD700] h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-white/70">60.7 GB de 1 TB usado</p>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* HEADER BRANCO */}
                <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => { }}>
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Barra de busca */}
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar no SIGE..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-sm"
                            />
                        </div>
                    </div>

                    {/* Ícones direita */}
                    <div className="flex items-center gap-5">
                        <button className="text-gray-500 hover:text-[#1E40AF]"><Bell className="w-5 h-5" /></button>
                        <button className="text-gray-500 hover:text-[#1E40AF]"><HelpCircle className="w-5 h-5" /></button>
                        <button className="text-gray-500 hover:text-[#1E40AF]"><Settings className="w-5 h-5" /></button>

                        {/* Perfil */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">{user?.nome || 'Super Admin'}</span>
                            <div className="w-8 h-8 rounded-full bg-[#1E40AF] flex items-center justify-center text-white font-bold text-sm">
                                {user?.nome?.[0] || 'S'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTEÚDO DA PÁGINA */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
