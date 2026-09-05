import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Building2, Settings, LogOut, Search, Bell, ShieldCheck, Menu, X, User
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/auth'
import ConfirmLogoutModal from '../pages/admin/components/modal_confirmLogout' // 1. IMPORT

const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
    { icon: Building2, label: 'Gerenciar Escolas', path: '/dashboard/schools' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
]

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [logoutOpen, setLogoutOpen] = useState(false) // 2. ESTADO
    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || { nome: 'Super Admin', email: 'admin@sige.ao' }

    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus()
        }
    }, [isSearchOpen])

    const handleNavigate = (path: string) => {
        navigate(path)
        setIsMobileMenuOpen(false)
    }

    const handleConfirmLogout = () => { // 3. FUNÇÃO
        authService.logout()
        toast.success("Sessão terminada")
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative">
            {/* BACKGROUND GLOW */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[120px] -z-10"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px] -z-10"></div>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* SIDEBAR FIXO - 80% no mobile, 260px no desktop */}
            <aside className={`fixed top-0 left-0 h-screen w-[80%] max-w-[300px] lg:w-[260px] p-4 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 h-full flex flex-col shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-8 h-8 text-[#3B82F6]" />
                            <h1 className="text-xl font-bold text-white">SIGE</h1>
                            <span className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-md">Admin</span>
                        </div>
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path
                            return (
                                <button key={item.path} onClick={() => handleNavigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold border border-[#3B82F6]/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* User info no final do sidebar */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user.nome}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* CONTEUDO COM MARGIN DO SIDEBAR */}
            <div className="lg:ml-[260px]">
                {/* HEADER FIXO */}
                <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-30 p-4 lg:p-8">
                    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-3 shadow-lg shadow-black/10">

                        <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-6 h-6 text-white" />
                        </button>

                        {/* BARRA DE BUSCA - APARECE E SOME */}
                        <div className={`flex-1 transition-all duration-300 ${isSearchOpen? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'} hidden md:block`}>
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    placeholder="Buscar escola..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border-white/10 rounded-xl focus:outline-none focus:border-[#3B82F6] text-sm text-white placeholder-gray-400"
                                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                                />
                            </div>
                        </div>

                        {/* AÇÕES DIREITA */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                                <Search className="w-5 h-5 text-white" />
                            </button>

                            <button className="p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                                <Bell className="w-5 h-5 text-white" />
                            </button>

                            <button className="hidden sm:flex items-center gap-2 p-2.5 lg:px-4 lg:py-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition">
                                <User className="w-5 h-5 text-white" />
                                <span className="text-sm font-semibold text-white hidden lg:inline">{user.nome.split(' ')[0]}</span>
                            </button>

                            {/* 4. BOTAO LOGOUT AGORA ABRE A MODAL */}
                            <button onClick={() => setLogoutOpen(true)} className="p-2.5 lg:p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition">
                                <LogOut className="w-5 h-5 text-red-400" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* CONTEUDO */}
                <main className="pt-[88px] lg:pt-[112px] p-4 lg:p-8 min-h-screen">
                    <Outlet />
                </main>
            </div>

            {/* 5. RENDER DA MODAL */}
            <ConfirmLogoutModal
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                onConfirm={handleConfirmLogout}
            />
        </div>
    )
}
