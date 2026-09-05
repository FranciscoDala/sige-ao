import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import {
    LayoutGrid, Building2, Settings, Power, Search, Bell, ShieldCheck, Menu, X, User, Loader2, Users, CircleHelp // 👈 ADD CircleHelp
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/auth'
import ConfirmLogoutModal from '../pages/admin/components/modal_confirmLogout'

const API_URL = import.meta.env.VITE_API_URL

const menuItems = [
    { icon: LayoutGrid, label: 'Painel', path: '/dashboard', type: 'Definição' },
    { icon: Building2, label: 'Escolas', path: '/dashboard/schools', type: 'Definição' },
    { icon: Users, label: 'Usuários', path: '/dashboard/users', type: 'Definição' },
    { icon: CircleHelp, label: 'Ajuda', path: '/dashboard/ajuda', type: 'Definição' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings', type: 'Definição', hidden: true }, // 👈 OCULTO
]

const getToken = (): string | null => localStorage.getItem('access_token');
const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

type SearchResult = { id: string; nome: string; path: string; type: 'Escola' | 'Usuário' | 'Definição'; sub?: string; Icon: any }

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)

    const [user, setUser] = useState(() => authService.getUser() || { nome: 'Super Admin', email: 'admin@sige.ao' })

    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const updateUser = () => {
            const u = authService.getUser()
            if (u) setUser(u)
        }
        window.addEventListener('storage', updateUser)
        window.addEventListener('user-updated', updateUser)
        return () => {
            window.removeEventListener('storage', updateUser)
            window.removeEventListener('user-updated', updateUser)
        }
    }, [])

    useEffect(() => {
        if (isSearchOpen || isSearchModalOpen) setTimeout(() => searchInputRef.current?.focus(), 100)
    }, [isSearchOpen, isSearchModalOpen])

    const handleNavigate = (path: string) => {
        navigate(path)
        setIsMobileMenuOpen(false)
        setIsSearchModalOpen(false)
        setSearchQuery('')
        setIsSearchOpen(false)
    }

    const handleConfirmLogout = () => {
        authService.logout()
        toast.success("Sessão terminada")
        navigate('/login')
    }

    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return }
        const delay = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await api.get(`/escolas/search/global?q=${searchQuery}`)
                const results: SearchResult[] = [
                    ...res.data.escolas?.map((e: any) => ({
                        id: e.id,
                        nome: e.nome,
                        sub: e.provincia,
                        path: `/dashboard/schools/${e.id}`,
                        type: 'Escola' as const,
                        Icon: Building2
                    })) || [],
                    ...res.data.usuarios?.map((u: any) => ({
                        id: u.id,
                        nome: u.nome,
                        sub: u.email,
                        path: `/dashboard/users/${u.id}`,
                        type: 'Usuário' as const,
                        Icon: User
                    })) || [],
                    ...menuItems.filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase())).map(m => ({
                        id: m.path,
                        nome: m.label,
                        path: m.path,
                        type: 'Definição' as const,
                        Icon: m.icon
                    }))
                ]
                setSearchResults(results)
            } catch (err: any) {
                if (err.response?.status !== 404) {
                    toast.error(`Erro na pesquisa: ${err.response?.data?.detail || err.message}`)
                }
                setSearchResults([])
            } finally { setSearching(false) }
        }, 400)
        return () => clearTimeout(delay)
    }, [searchQuery])

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative flex overflow-x-hidden">
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[120px] -z-10"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px] -z-10"></div>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

            <aside className={`fixed top-0 left-0 h-screen w-[80%] max-w-[280px] lg:w-[260px] p-3 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-full flex flex-col shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-[#3B82F6] flex-shrink-0" />
                            <h1 className="text-xl font-bold text-white whitespace-nowrap">SIGE</h1>
                            <span className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-md font-semibold flex-shrink-0">Admin</span>
                        </div>
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <nav className="space-y-1 flex-1">
                        {menuItems.filter(item => !item.hidden).map(item => { // 👈 FILTRA AQUI
                            const isActive = item.path === '/dashboard'
                                ? location.pathname === '/dashboard'
                                : location.pathname.startsWith(item.path)

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive
                                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold border-[#3B82F6]/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-white" /></div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">{user.nome}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 w-full lg:ml-[260px]">
                <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-30 p-3 lg:p-6">
                    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl px-3 lg:px-6 py-3 flex items-center justify-between gap-2 shadow-lg shadow-black/10">
                        <button className="lg:hidden p-2 flex-shrink-0" onClick={() => setIsMobileMenuOpen(true)}><Menu className="w-6 h-6 text-white" /></button>

                        <div className={`relative flex-1 transition-all duration-300 ${isSearchOpen ? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'} hidden md:block`}>
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar escola, usuário..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border-white/10 rounded-xl focus:outline-none focus:border-[#3B82F6] text-sm text-white placeholder-gray-400"
                            />
                            {searchQuery && (
                                <div className="absolute top-14 w-full bg-[#1E293B]/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                                    {searching && <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#3B82F6]" /></div>}
                                    {!searching && searchQuery.length >= 2 && searchResults.length === 0 && <p className="p-4 text-gray-400 text-sm">Nenhum resultado</p>}
                                    {searchResults.map(item => (
                                        <button key={item.id} onClick={() => handleNavigate(item.path)} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left transition">
                                            <item.Icon className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">{item.nome}</p>
                                                <p className="text-xs text-gray-400">{item.type} {item.sub && `• ${item.sub}`}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                            <button onClick={() => window.innerWidth < 768 ? setIsSearchModalOpen(true) : setIsSearchOpen(!isSearchOpen)} className="p-2.5 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition flex-shrink-0">
                                <Search className="w-5 h-5 text-white" />
                            </button>
                            <button className="p-2.5 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition flex-shrink-0"><Bell className="w-5 h-5 text-white" /></button>
                            <button className="hidden sm:flex items-center gap-2 p-2.5 lg:px-4 lg:py-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition flex-shrink-0">
                                <User className="w-5 h-5 text-white" /><span className="text-sm font-semibold text-white hidden lg:inline">{user.nome.split(' ')[0]}</span>
                            </button>
                            <button onClick={() => setLogoutOpen(true)} className="p-2.5 bg-red-500/10 border-red-500/20 rounded-xl hover:bg-red-500/20 hover:border-red-500/40 transition group flex-shrink-0" title="Sair">
                                <Power className="w-5 h-5 text-red-400 group-hover:text-red-300 transition" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="pt-28 lg:pt-32 p-3 lg:p-6 w-full">
                    <Outlet />
                </main>
            </div>

            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[60] bg-[#0F172A] flex-col p-4 md:hidden animate-in fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Pesquisar</h2>
                        <button onClick={() => { setIsSearchModalOpen(false); setSearchQuery('') }} className="p-2 -mr-2">
                            <X className="w-6 h-6 text-gray-300" />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar escolas, usuários..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-white/10 rounded-xl focus:outline-none focus:border-[#3B82F6] text-white placeholder-gray-400"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white/5 rounded-2xl border-white/10 p-2">
                        {!searchQuery && <p className="text-center text-gray-400 pt-10">Digite para começar a pesquisar</p>}
                        {searching && <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" /></div>}
                        {!searching && searchQuery.length >= 2 && searchResults.length === 0 && <p className="text-center text-gray-400 pt-10">Nenhum resultado encontrado</p>}
                        {searchResults.map(item => (
                            <button key={item.id} onClick={() => handleNavigate(item.path)} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left transition">
                                <item.Icon className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-white font-medium truncate">{item.nome}</p>
                                    <p className="text-xs text-gray-400">{item.type} {item.sub && `• ${item.sub}`}</p>
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
