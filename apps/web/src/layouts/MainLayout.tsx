import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import {
    LayoutGrid, Settings, Power, Search, Bell, School, Menu, X, User, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/auth'
import ConfirmLogoutModal from '../pages/admin/components/modal_confirmLogout'

const API_URL = import.meta.env.VITE_API_URL

const menuItems = [
    { icon: LayoutGrid, label: 'Painel', path: '/dashboard', type: 'Definição' },
    { icon: Settings, label: 'Definições', path: '/dashboard/definicoes', type: 'Definição' },
]

const getToken = (): string | null => localStorage.getItem('access_token');
const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

type SearchResult = { id: string; nome: string; path: string; type: 'Definição'; sub?: string; Icon: any }

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [user, setUser] = useState(() => authService.getUser() || { nome: 'Diretor', email: 'diretor@escola.ao' })
    const [tema, setTema] = useState<any>(null)

    const searchInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const location = useLocation()

    const isClaro = tema?.tema === 'claro'

    // 👇 Busca tema do banco ao montar
    useEffect(() => {
        const fetchTema = async () => {
            try {
                const res = await api.get('/escolas/me')
                const data = res.data
                setTema(data)
                localStorage.setItem('escola_tema', JSON.stringify(data))

                // Aplica no :root
                const root = document.documentElement
                root.style.setProperty('--cor-primaria', data.cor_primaria || '#3B82F6')
                root.style.setProperty('--cor-secundaria', data.cor_secundaria || '#8B5CF6')
                root.style.setProperty('--cor-fundo', data.cor_fundo || '#FFFFFF')
                root.setAttribute('data-tema', data.tema || 'escuro')
                root.setAttribute('data-card-style', data.estilo_card || 'arredondado') // 👈 NOVO
            } catch (e) {
                console.error("Erro ao buscar tema", e)
            }
        }
        fetchTema()
    }, [])

    useEffect(() => {
        const updateUser = () => {
            const u = authService.getUser()
            if (u) setUser(u)
            const t = localStorage.getItem('escola_tema')
            if (t) setTema(JSON.parse(t))
        }
        window.addEventListener('storage', updateUser)
        window.addEventListener('user-updated', updateUser)
        window.addEventListener('escola-tema-updated', updateUser)
        return () => {
            window.removeEventListener('storage', updateUser)
            window.removeEventListener('user-updated', updateUser)
            window.removeEventListener('escola-tema-updated', updateUser)
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
        navigate('/')
    }

    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults([]); return }
        const delay = setTimeout(async () => {
            setSearching(true)
            try {
                const results: SearchResult[] = [
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
                toast.error(`Erro na pesquisa: ${err.response?.data?.detail || err.message}`)
                setSearchResults([])
            } finally { setSearching(false) }
        }, 400)
        return () => clearTimeout(delay)
    }, [searchQuery])

    const corPrimaria = tema?.cor_primaria || '#3B82F6'
    const corSecundaria = tema?.cor_secundaria || '#8B5CF6'
    const textPrimary = isClaro? '#1E293B' : 'white'
    const textSecondary = isClaro? '#64748B' : '#9CA3AF'

    return (
        <div
            className="min-h-screen w-full relative flex overflow-x-hidden"
            style={{
                background: isClaro
                   ? `linear-gradient(to bottom right, ${corPrimaria}08, ${corSecundaria}05, var(--cor-fundo))`
                    : `linear-gradient(to bottom right, ${corPrimaria}15, ${corSecundaria}10, #0F172A)`
            }}
        >
            <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] -z-10" style={{ backgroundColor: `${corPrimaria}20` }}></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] -z-10" style={{ backgroundColor: `${corSecundaria}20` }}></div>

            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

            <aside className={`fixed top-0 left-0 h-screen w-[80%] max-w-[280px] lg:w-[260px] p-3 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 h-full flex-col shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex items-center gap-3">
                            <School className="w-8 h-8 flex-shrink-0" style={{ color: corPrimaria }} />
                            <h1 className="text-xl font-bold whitespace-nowrap" style={{ color: textPrimary }}>SIGE</h1>
                            <span className="text-xs px-2 py-0.5 rounded-md font-semibold flex-shrink-0" style={{ backgroundColor: `${corPrimaria}33`, color: corPrimaria }}>Escola</span>
                        </div>
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="w-5 h-5" style={{ color: textSecondary }} />
                        </button>
                    </div>
                    <nav className="space-y-1 flex-1 overflow-y-auto">
                        {menuItems.map(item => {
                            const isActive = item.path === '/dashboard'? location.pathname === '/dashboard' : location.pathname.startsWith(item.path)

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition border ${isActive
                                       ? 'font-semibold border-opacity-30'
                                        : `hover:bg-white/5 border-transparent`
                                        }`}
                                    style={{
                                        backgroundColor: isActive? `${corPrimaria}20` : 'transparent',
                                        color: isActive? corPrimaria : textSecondary,
                                        borderColor: isActive? `${corPrimaria}4D` : 'transparent'
                                    }}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${corPrimaria}, ${corSecundaria})` }}>
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>{user.nome}</p>
                                <p className="text-xs truncate" style={{ color: textSecondary }}>{(user as any).escola_nome || user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 w-full lg:ml-[260px]">
                <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-30 p-3 lg:p-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-3 lg:px-6 py-3 flex items-center justify-between gap-2 shadow-lg shadow-black/10">
                        <button className="lg:hidden p-2 flex-shrink-0" onClick={() => setIsMobileMenuOpen(true)}><Menu className="w-6 h-6" style={{ color: textPrimary }} /></button>

                        <div className={`relative flex-1 transition-all duration-300 ${isSearchOpen? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'} hidden md:block`}>
                            <Search className="absolute left-4 top-3.5 w-5 h-5" style={{ color: textSecondary }} />
                            <input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar no menu..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border-white/10 rounded-xl focus:outline-none text-sm"
                                style={{
                                    borderColor: isSearchOpen? corPrimaria : '',
                                    color: textPrimary,
                                    backgroundColor: isClaro? 'rgba(0,0,0,0.03)' : ''
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                            <button onClick={() => window.innerWidth < 768? setIsSearchModalOpen(true) : setIsSearchOpen(!isSearchOpen)} className="p-2.5 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition flex-shrink-0">
                                <Search className="w-5 h-5" style={{ color: textPrimary }} />
                            </button>
                            <button className="p-2.5 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition flex-shrink-0"><Bell className="w-5 h-5" style={{ color: textPrimary }} /></button>
                            <button className="hidden sm:flex items-center gap-2 p-2.5 lg:px-4 lg:py-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 transition flex-shrink-0">
                                <User className="w-5 h-5" style={{ color: textPrimary }} />
                                <span className="text-sm font-semibold hidden lg:inline" style={{ color: textPrimary }}>{user.nome.split(' ')[0]}</span>
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
                <div
                    className="fixed inset-0 z-[60] flex-col p-4 md:hidden animate-in fade-in"
                    style={{ backgroundColor: isClaro? 'var(--cor-fundo)' : '#0F172A' }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Pesquisar</h2>
                        <button onClick={() => { setIsSearchModalOpen(false); setSearchQuery('') }} className="p-2 -mr-2">
                            <X className="w-6 h-6" style={{ color: textSecondary }} />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-3.5 w-5 h-5" style={{ color: textSecondary }} />
                        <input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar no menu..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-white/10 rounded-xl focus:outline-none"
                            style={{
                                borderColor: searchQuery? corPrimaria : '',
                                color: textPrimary,
                                backgroundColor: isClaro? 'rgba(0,0,0,0.03)' : ''
                            }}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white/5 rounded-2xl border-white/10 p-2">
                        {!searchQuery && <p className="text-center pt-10" style={{ color: textSecondary }}>Digite para começar a pesquisar</p>}
                        {searching && <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: corPrimaria }} /></div>}
                        {!searching && searchQuery.length >= 2 && searchResults.length === 0 && <p className="text-center pt-10" style={{ color: textSecondary }}>Nenhum resultado encontrado</p>}
                        {searchResults.map(item => (
                            <button key={item.id} onClick={() => handleNavigate(item.path)} className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-left transition">
                                <item.Icon className="w-5 h-5 flex-shrink-0" style={{ color: corPrimaria }} />
                                <div className="min-w-0">
                                    <p className="font-medium truncate" style={{ color: textPrimary }}>{item.nome}</p>
                                    <p className="text-xs" style={{ color: textSecondary }}>{item.type}</p>
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
