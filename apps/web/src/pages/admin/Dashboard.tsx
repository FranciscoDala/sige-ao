import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import {
    LayoutGrid, Building2, Settings, Power, Search, Bell, ShieldCheck, Menu, X, User, Loader2 // LayoutGrid = Painel
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../../services/auth'
import ConfirmLogoutModal from '../../pages/admin/components/modal_confirmLogout'

const API_URL = import.meta.env.VITE_API_URL

const menuItems = [
    { icon: LayoutGrid, label: 'Painel', path: '/dashboard', type: 'Definição' }, // <- Mudei pra Painel
    { icon: Building2, label: 'Gerenciar Escolas', path: '/dashboard/schools', type: 'Definição' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings', type: 'Definição' },
]

const getToken = (): string | null => localStorage.getItem('access_token');
const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

type SearchResult = {
    id: string
    nome: string
    path: string
    type: 'Escola' | 'Usuário' | 'Definição'
    sub?: string
    Icon: any
}

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const user = authService.getUser() || { nome: 'Super Admin', email: 'admin@sige.ao' }

    useEffect(() => {
        if (isSearchOpen || isSearchModalOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100)
        }
    }, [isSearchOpen, isSearchModalOpen])

    const handleNavigate = (path: string) => {
        navigate(path)
        setIsMobileMenuOpen(false)
        setIsSearchModalOpen(false)
        setSearchQuery('')
    }

    const handleConfirmLogout = () => {
        authService.logout()
        toast.success("Sessão terminada")
        navigate('/login')
    }

    // BUSCA REAL
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        const delay = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await api.get(`/search?q=${searchQuery}`)
                const results: SearchResult[] = [
                    ...res.data.escolas?.map((e: any) => ({
                        id: e.id, nome: e.nome, sub: e.provincia, path: `/dashboard/schools/${e.id}`, type: 'Escola' as const, Icon: Building2
                    })) || [],
                    ...res.data.usuarios?.map((u: any) => ({
                        id: u.id, nome: u.nome, sub: u.email, path: `/dashboard/users/${u.id}`, type: 'Usuário' as const, Icon: User
                    })) || [],
                    ...menuItems.filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase())).map(m => ({
                        id: m.path, nome: m.label, path: m.path, type: 'Definição' as const, Icon: m.icon
                    }))
                ]
                setSearchResults(results)
            } catch (err: any) {
                toast.error(`Erro na pesquisa: ${err.response?.data?.detail || err.message}`)
                setSearchResults([])
            } finally {
                setSearching(false)
            }
        }, 400)
        return () => clearTimeout(delay)
    }, [searchQuery])

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative flex"> {/* ADICIONEI FLEX AQUI */}
            {/* BACKGROUND GLOW */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[120px] -z-10"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px] -z-10"></div>

            {/* MOBILE OVERLAY */}
            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

            {/* SIDEBAR FIXO */}
            <aside className={`fixed top-0 left-0 h-screen w-[85%] max-w-[280px] lg:w-[260px] p-4 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-full flex flex-col shadow-2xl shadow-black/20"> {/* flex-col */}

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-[#3B82F6] flex-shrink-0" />
                            <h1 className="text-xl font-bold text-white whitespace-nowrap">SIGE</h1>
                            <span className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-md font-semibold flex-shrink-0">Admin</span>
                        </div>
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {menuItems.map(item => {
                            const isActive = location.pathname.startsWith(item.path) // startsWith pra marcar ativo
                            return (
                                <button key={item.path} onClick={() => handleNavigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold border-[#3B82F6]/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    {/* FOOTER USER */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-white" /></div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">{user.nome}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* CONTEUDO COM MARGIN */}
            <div className="flex-1 lg:ml-[260px]"> {/* flex-1 + ml */}
                {/* HEADER */}
                <header className="sticky top-0 z-30 p-4 lg:p-6"> {/* sticky ao inves de fixed */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-3 shadow-lg shadow-black/10">
                        <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}><Menu className="w-6 h-6 text-white" /></button>

                        {/* BUSCA DESKTOP */}
                        <div className={`relative flex-1 transition-all duration-300 ${isSearchOpen? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'} hidden md:block`}>
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar escola, usuário..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#3B82F6] text-sm text-white placeholder-gray-400"
                            />
                            {searchQuery && (
                                <div className="absolute top-14 w-full bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                                    {searching && <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#3B82F6]"/></div>}
                                    {!searching && searchResults.length === 0 && <p className="p-4 text-gray-400 text-sm">Nenhum resultado</p>}
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

                        <div className="flex items-center gap-2 ml-auto"> {/* ml-auto pra jogar pra direita */}
                            <button onClick={() => window.innerWidth < 768? setIsSearchModalOpen(true) : setIsSearchOpen(!isSearchOpen)} className="p-2.5 lg:p-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition">
                                <Search className="w-5 h-5 text-white" />
                            </button>
                            <button className="p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"><Bell className="w-5 h-5 text-white" /></button>
                            <button className="hidden sm:flex items-center gap-2 p-2.5 lg:px-4 lg:py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                                <User className="w-5 h-5 text-white" /><span className="text-sm font-semibold text-white hidden lg:inline">{user.nome.split(' ')[0]}</span>
                            </button>
                            <button onClick={() => setLogoutOpen(true)} className="p-2.5 lg:p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:border-red-500/40 transition group" title="Sair">
                                <Power className="w-5 h-5 text-red-400 group-hover:text-red-300 transition" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* MODAL PESQUISA MOBILE */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col p-4 md:hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="w-full pl-12 pr-4 py-3 bg-white/10 border-white/20 rounded-xl focus:outline-none focus:border-[#3B82F6] text-white placeholder-gray-400" />
                        </div>
                        <button onClick={() => {setIsSearchModalOpen(false); setSearchQuery('')}} className="p-2.5"><X className="w-6 h-6 text-white" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white/5 rounded-2xl border border-white/10 p-2">
                        {!searchQuery && <p className="text-center text-gray-400 pt-10">Digite para pesquisar...</p>}
                        {searching && <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]"/></div>}
                        {!searching && searchQuery && searchResults.length === 0 && <p className="text-center text-gray-400 pt-10">Nenhum resultado encontrado</p>}
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
