import { useState, useRef, useEffect, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import {
    LayoutGrid, Settings, Power, Search, Bell, Menu, Loader2, Sun, Moon, X, User // 👈 ADICIONEI X E USER
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/auth'
import ConfirmLogoutModal from '../pages/admin/components/modal_confirmLogout'
import Sidebar from './components/mainLayout_sidebar' // 👈 NOVO

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

    const applyTheme = (data: any) => {
        setTema(data)
        localStorage.setItem('escola_tema', JSON.stringify(data))
        const root = document.documentElement
        root.style.setProperty('--cor-primaria', data.cor_primaria || '#3B82F6')
        root.style.setProperty('--cor-secundaria', data.cor_secundaria || '#8B5CF6')
        root.style.setProperty('--cor-fundo', data.cor_fundo || '#FFFFFF')
        root.setAttribute('data-tema', data.tema || 'escuro')
        root.setAttribute('data-card-style', data.estilo_card || 'arredondado')
        root.setAttribute('data-fonte-titulo', data.fonte_titulo || 'Poppins')
        root.setAttribute('data-fonte-corpo', data.fonte_corpo || 'Inter')
    }

    useEffect(() => {
        const fetchTema = async () => {
            try {
                const res = await api.get('/escolas/me')
                applyTheme(res.data)
            } catch (e) {
                console.error("Erro ao buscar tema", e)
            }
        }
        fetchTema()

        const handleTemaUpdated = () => {
            const t = localStorage.getItem('escola_tema')
            if (t) applyTheme(JSON.parse(t))
        }
        const updateUser = () => {
            const u = authService.getUser()
            if (u) setUser(u)
        }

        window.addEventListener('storage', handleTemaUpdated)
        window.addEventListener('user-updated', updateUser)
        window.addEventListener('escola-tema-updated', handleTemaUpdated)

        return () => {
            window.removeEventListener('storage', handleTemaUpdated)
            window.removeEventListener('user-updated', updateUser)
            window.removeEventListener('escola-tema-updated', handleTemaUpdated)
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

    const toggleTema = async () => {
        const novoTema = isClaro ? 'escuro' : 'claro'
        const novoTemaData = { ...tema, tema: novoTema }

        applyTheme(novoTemaData)
        window.dispatchEvent(new Event('escola-tema-updated'))

        try {
            await api.put('/escolas/me/tema', { tema: novoTema })
            toast.success(`Tema alterado para ${novoTema}`)
        } catch (e) {
            toast.error('Erro ao salvar tema')
            applyTheme(tema)
        }
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

    const textPrimary = useMemo(() => isClaro ? '#1E293B' : 'white', [isClaro])
    const textSecondary = useMemo(() => isClaro ? '#475569' : '#9CA3AF', [isClaro])
    const bgCard = useMemo(() => isClaro ? 'bg-black/5' : 'bg-white/5', [isClaro])
    const borderCard = useMemo(() => isClaro ? 'border-black/10' : 'border-white/10', [isClaro])
    const hoverBg = useMemo(() => isClaro ? 'hover:bg-black/5' : 'hover:bg-white/10', [isClaro])

    const getCardStyle = () => {
        const estilo = tema?.estilo_card || 'arredondado'

        // 👇 REGRA NOVA: Se for claro, fundo sólido. Se for escuro, vidro
        if (isClaro) {
            const baseClaro = `bg-white border border-black/10 shadow-lg`
            switch (estilo) {
                case 'quadrado': return `${baseClaro} rounded-none`
                case 'minimalista': return `${baseClaro} rounded-lg border-0`
                case 'elevado': return `${baseClaro} rounded-2xl shadow-2xl`
                case 'borda_colorida': return `${baseClaro} rounded-2xl border-2`
                case 'glass': return `${baseClaro} rounded-2xl` // glass vira solido no claro
                default: return `${baseClaro} rounded-2xl`
            }
        } else {
            // Dark continua com vidro
            const baseEscuro = `bg-white/5 backdrop-blur-xl border-white/10`
            switch (estilo) {
                case 'quadrado': return `${baseEscuro} rounded-none`
                case 'minimalista': return `${baseEscuro} rounded-lg border-0`
                case 'elevado': return `${baseEscuro} rounded-2xl shadow-2xl shadow-black/20`
                case 'borda_colorida': return `${baseEscuro} rounded-2xl border-2`
                case 'glass': return `bg-white/10 backdrop-blur-2xl border-white/10 rounded-2xl`
                default: return `${baseEscuro} rounded-2xl`
            }
        }
    }
    const cardClass = getCardStyle()

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

            {/* 👇 SIDEBAR SEPARADO */}
            <Sidebar
                menuItems={menuItems}
                onNavigate={handleNavigate}
                onClose={() => setIsMobileMenuOpen(false)}
                isOpen={isMobileMenuOpen}
                corPrimaria={corPrimaria}
                corSecundaria={corSecundaria}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                bgCard={bgCard}
                borderCard={borderCard}
                hoverBg={hoverBg}
                cardClass={cardClass}
                user={user}
                tema={tema}
            />

            <div className="flex-1 w-full lg:ml-[260px]">
                <header className="fixed top-0 right-0 left-0 lg:left-[260px] z-30 p-3 lg:p-6">
                    <div className={`${cardClass} px-3 lg:px-6 py-3 flex items-center justify-between gap-2 shadow-lg shadow-black/10`}>
                        <button className="lg:hidden p-2 flex-shrink-0" onClick={() => setIsMobileMenuOpen(true)}><Menu className="w-6 h-6" style={{ color: textPrimary }} /></button>

                        <div className={`relative flex-1 transition-all duration-300 ${isSearchOpen ? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'} hidden md:block`}>
                            <Search className="absolute left-4 top-3.5 w-5 h-5" style={{ color: textSecondary }} />
                            <input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar no menu..."
                                className={`w-full pl-12 pr-4 py-3 ${bgCard} ${borderCard} rounded-xl focus:outline-none text-sm`}
                                style={{ borderColor: isSearchOpen ? corPrimaria : '', color: textPrimary }}
                            />
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                            <button onClick={() => window.innerWidth < 768 ? setIsSearchModalOpen(true) : setIsSearchOpen(!isSearchOpen)} className={`p-2.5 ${bgCard} ${borderCard} rounded-xl ${hoverBg} transition flex-shrink-0`}>
                                <Search className="w-5 h-5" style={{ color: textPrimary }} />
                            </button>

                            <button
                                onClick={toggleTema}
                                className={`p-2.5 ${bgCard} ${borderCard} rounded-xl ${hoverBg} transition flex-shrink-0`}
                                title={isClaro ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
                            >
                                {isClaro ? <Moon className="w-5 h-5" style={{ color: textPrimary }} /> : <Sun className="w-5 h-5" style={{ color: textPrimary }} />}
                            </button>

                            <button className={`p-2.5 ${bgCard} ${borderCard} rounded-xl ${hoverBg} transition flex-shrink-0`}><Bell className="w-5 h-5" style={{ color: textPrimary }} /></button>
                            <button className={`hidden sm:flex items-center gap-2 p-2.5 lg:px-4 lg:py-3 ${bgCard} ${borderCard} rounded-xl ${hoverBg} transition flex-shrink-0`}>
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
                <div className="fixed inset-0 z-[60] flex flex-col p-4 md:hidden animate-in fade-in" style={{ backgroundColor: isClaro ? 'var(--cor-fundo)' : '#0F172A' }}>
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
                            className={`w-full pl-12 pr-4 py-3.5 ${bgCard} ${borderCard} rounded-xl focus:outline-none`}
                            style={{ borderColor: searchQuery ? corPrimaria : '', color: textPrimary }}
                        />
                    </div>
                    <div className={`flex-1 overflow-y-auto ${cardClass} p-2`}>
                        {!searchQuery && <p className="text-center pt-10" style={{ color: textSecondary }}>Digite para começar a pesquisar</p>}
                        {searching && <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: corPrimaria }} /></div>}
                        {!searching && searchQuery.length >= 2 && searchResults.length === 0 && <p className="text-center pt-10" style={{ color: textSecondary }}>Nenhum resultado encontrado</p>}
                        {searchResults.map(item => (
                            <button key={item.id} onClick={() => handleNavigate(item.path)} className={`w-full flex items-center gap-3 p-3 ${hoverBg} rounded-xl text-left transition`}>
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
