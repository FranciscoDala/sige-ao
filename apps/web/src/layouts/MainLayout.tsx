import { useState, useRef, useEffect, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Building2, Settings, Power, Search, Bell, ShieldCheck, Menu, X, User, FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/auth'
import ConfirmLogoutModal from '../pages/admin/components/modal_confirmLogout'

const menuItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/dashboard', type: 'Definição' },
    { icon: Building2, label: 'Gerenciar Escolas', path: '/dashboard/schools', type: 'Escola' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings', type: 'Definição' },
]

const mockEscolas = [
    { id: '1', nome: 'Escola 1234', path: '/dashboard/schools/1' },
    { id: '2', nome: 'Escola Mutamba', path: '/dashboard/schools/2' },
]
const mockUsers = [
    { id: '1', nome: 'João Silva', email: 'joao@sige.ao', path: '/dashboard/users/1' },
]

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || { nome: 'Super Admin', email: 'admin@sige.ao' }

    useEffect(() => {
        if (isSearchOpen) searchInputRef.current?.focus()
        if (isSearchModalOpen) setTimeout(() => searchInputRef.current?.focus(), 100)
    }, [isSearchOpen, isSearchModalOpen])

    const handleNavigate = (path: string) => {
        navigate(path)
        setIsMobileMenuOpen(false)
        setIsSearchModalOpen(false)
    }

    const handleConfirmLogout = () => {
        authService.logout()
        toast.success("Sessão terminada")
        navigate('/login')
    }

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return []
        const q = searchQuery.toLowerCase()
        const escolas = mockEscolas.filter(e => e.nome.toLowerCase().includes(q)).map(e => ({...e, type: 'Escola', Icon: Building2}))
        const users = mockUsers.filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).map(u => ({...u, type: 'Usuário', Icon: User}))
        const defs = menuItems.filter(m => m.label.toLowerCase().includes(q)).map(m => ({id: m.path, nome: m.label, path: m.path, type: m.type, Icon: m.icon}))
        return [...escolas,...users,...defs]
    }, [searchQuery])

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative">
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[120px] -z-10"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px] -z-10"></div>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

            {/* SIDEBAR: AUMENTEI PARA 85% E MAIS PADDING */}
            <aside className={`fixed top-0 left-0 h-screen w-[85%] max-w-[320px] lg:w-[260px] p-5 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 h-full flex flex-col shadow-2xl shadow-black/20">

                    {/* HEADER SIDEBAR: MAIS GAP */}
                    <div className="flex items-center justify-between mb-10 px-1">
                        <div className="flex items-center gap-4"> {/* gap-4 */}
                            <ShieldCheck className="w-9 h-9 text-[#3B82F6] flex-shrink-0" />
                            <h1 className="text-2xl font-bold text-white tracking-wide">SIGE</h1> {/* text-2xl */}
                            <span className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2.5 py-1 rounded-md font-bold flex-shrink-0">Admin</span> {/* px-2.5 py-1 */}
                        </div>
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>

                    <nav className="space-y-2 flex-1"> {/* space-y-2 */}
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path
                            return (
                                <button key={item.path} onClick={() => handleNavigate(item.path)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] transition ${isActive? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold border border-[#3B82F6]/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}> {/* gap-4 py-3.5 */}
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{item.label}</span> {/* whitespace-nowrap */}
                                </button>
                            )
                        })}
                    </nav>

                    {/* FOOTER SIDEBAR: MAIS GAP E TAMANHO */}
                    <div className="border-t border-white/10 pt-5 mt-5">
                        <div className="flex items-center gap-4 px-1"> {/* gap-4 */}
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0"> {/* w-11 h-11 */}
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-bold text-white truncate">{user.nome}</p> {/* font-bold text-[15px] */}
                                <p className="text-sm text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="lg:ml-[260px]">
                <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-30 p-4 lg:p-8">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-3 shadow-lg shadow-black/10">
                        <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}><Menu className="w-6 h-6 text-white" /></button>

                        <div className={`flex-1 transition-all duration-300 ${isSearchOpen? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'} hidden md:block`}>
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input ref={searchInputRef} placeholder="Buscar escola, usuário..." className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#3B82F6] text-sm text-white placeholder-gray-400" onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => window.innerWidth < 768? setIsSearchModalOpen(true) : setIsSearchOpen(!isSearchOpen)} className="p-2.5 lg:p-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition">
                                <Search className="w-5 h-5 text-white" />
                            </button>
                            <button className="p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"><Bell className="w-5 h-5 text-white" /></button>
                            <button className="hidden sm:flex items-center gap-2 p-2.5 lg:px-4 lg:py-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition">
                                <User className="w-5 h-5 text-white" /><span className="text-sm font-semibold text-white hidden lg:inline">{user.nome.split(' ')[0]}</span>
                            </button>
                            <button onClick={() => setLogoutOpen(true)} className="p-2.5 lg:p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:border-red-500/40 transition group" title="Sair">
                                <Power className="w-5 h-5 text-red-400 group-hover:text-red-300 transition" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="pt-[88px] lg:pt-[112px] p-4 lg:p-8 min-h-screen"><Outlet /></main>
            </div>

            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col p-4 md:hidden animate-in fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar escolas, usuários..." className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-[#3B82F6] text-white placeholder-gray-400" />
                        </div>
                        <button onClick={() => {setIsSearchModalOpen(false); setSearchQuery('')}} className="p-2.5"><X className="w-6 h-6 text-white" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white/5 rounded-2xl border border-white/10 p-2">
                        {searchQuery.length === 0 && <p className="text-center text-gray-400 pt-10">Digite para pesquisar...</p>}
                        {searchQuery.length > 0 && searchResults.length === 0 && <p className="text-center text-gray-400 pt-10">Nenhum resultado encontrado</p>}
                        {searchResults.map(item => (
                            <button key={item.id} onClick={() => handleNavigate(item.path)} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left transition">
                                <item.Icon className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-white font-medium truncate">{item.nome}</p>
                                    <p className="text-xs text-gray-400">{item.type}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleConfirmLogout} />
        </div>
    )
}
