import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
    Building2, Users, MapPin, TrendingUp, Trash2, Plus,
    ChevronDown, Loader2, School, Menu, X, Shield, LayoutGrid, Settings, LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import StatCard from './components/card_stat'
import EscolaCard from './components/card_escolas'
import EscolaModal, { Escola } from './components/modal_escola'
import ConfirmDeleteModal from './components/modal_confirmDelete'
import ConfirmLogoutModal from './components/modal_confirmLogout'

const API_URL = import.meta.env.VITE_API_URL

const getToken = (): string | null => localStorage.getItem('access_token');

const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [filtroStatus, setFiltroStatus] = useState('todas')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [escolaEditando, setEscolaEditando] = useState<Escola | null>(null)
    const [saving, setSaving] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [escolaParaDeletar, setEscolaParaDeletar] = useState<string | null>(null)
    const [logoutOpen, setLogoutOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current &&!dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchEscolas = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (filtroStatus === 'ativa') params.ativo = true
            if (filtroStatus === 'inativa') params.ativo = false
            const res = await api.get<Escola[]>(`/escolas`, { params })
            setEscolas(res.data)
        } catch (err: any) {
            toast.error(`Erro ao carregar escolas: ${err.response?.data?.detail || err.message}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchEscolas() }, [filtroStatus])

    const handleSaveEscola = async (data: FormData, id?: string) => {
        setSaving(true)
        try {
            if (id) await api.put(`/escolas/${id}`, data)
            else await api.post(`/escolas`, data)
            toast.success(id? "Escola atualizada!" : "Escola criada!")
            setModalOpen(false)
            setEscolaEditando(null)
            fetchEscolas()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erro ao salvar escola")
        } finally {
            setSaving(false)
        }
    }

    const handleOpenCreate = () => { setEscolaEditando(null); setModalOpen(true) }
    const handleOpenEdit = (escola: Escola) => { setEscolaEditando(escola); setModalOpen(true) }
    const handleDeleteClick = (id: string) => { setEscolaParaDeletar(id); setConfirmOpen(true) }

    const handleConfirmDelete = async () => {
        if (!escolaParaDeletar) return
        try {
            await api.delete(`/escolas/${escolaParaDeletar}`)
            toast.success("Escola desativada")
            fetchEscolas()
        } catch {
            toast.error("Erro ao desativar")
        } finally {
            setConfirmOpen(false)
            setEscolaParaDeletar(null)
        }
    }

    const handleConfirmLogout = () => {
        localStorage.removeItem('access_token')
        toast.success("Sessão terminada")
        window.location.href = '/login'
    }

    const opcoesFiltro = [
        { value: 'todas', label: 'Todas as Escolas', icon: Building2 },
        { value: 'ativa', label: 'Apenas Ativas', icon: TrendingUp },
        { value: 'inativa', label: 'Apenas Inativas', icon: Trash2 },
    ]
    const opcaoSelecionada = opcoesFiltro.find(o => o.value === filtroStatus)

    const stats = [
        { title: "Total de Escolas", value: escolas.length, icon: Building2, color: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" },
        { title: "Escolas Ativas", value: escolas.filter(e => e.ativo).length, icon: Users, color: "bg-gradient-to-br from-[#10B981] to-[#059669]" },
        { title: "Províncias", value: new Set(escolas.map(e => e.provincia)).size, icon: MapPin, color: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]" },
    ]

    const menu = [
        { label: 'Visão Geral', icon: LayoutGrid, active: true },
        { label: 'Gerenciar Escolas', icon: Building2 },
        { label: 'Configurações', icon: Settings },
        { label: 'Sair', icon: LogOut, action: () => setLogoutOpen(true) },
    ]

    return (
        <div className="flex bg-[#0F172A] min-h-screen text-white">
            {/* OVERLAY MOBILE */}
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />}

            {/* ===== SIDEBAR PROFISSIONAL ===== */}
            <aside className={`
                fixed top-4 left-4 z-50 h-[calc(100%-2rem)]
                w-[80%] max-w-[280px] md:w-64 /* 80% mobile, 256px desktop */
                bg-[#111827] border border-white/10 rounded-2xl
                transition-transform duration-300 ease-in-out
                ${sidebarOpen? 'translate-x-0' : '-translate-x-[120%]'} /* sai 100% da tela */
                md:translate-x-0
                flex-col shadow-2xl
            `}>
                {/* HEADER LOGO */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3B82F6]/15 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-[#3B82F6]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-white tracking-tight">SIGE</h1>
                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#3B82F6]/20 text-[#3B82F6] rounded-md">Admin</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* NAV */}
                <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                    {menu.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => { setSidebarOpen(false); item.action?.() }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                                ${item.active
                                   ? 'bg-white/10 text-white font-semibold'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* CONTEUDO PRINCIPAL */}
            <main className="flex-1 md:ml-72 p-4 md:p-6">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden mb-4 p-2 rounded-lg bg-white/5 hover:bg-white/10">
                    <Menu className="w-6 h-6" />
                </button>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Painel</h2>
                        <p className="text-gray-400">Gerencie todas as escolas cadastradas</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div ref={dropdownRef} className="relative w-full sm:w-1/2">
                            <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-between">
                                <div className="flex items-center gap-3 truncate">{opcaoSelecionada && <opcaoSelecionada.icon className="w-5 h-5 text-[#3B82F6]" />}<span className="truncate">{opcaoSelecionada?.label}</span></div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen? 'rotate-180' : ''}`} />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-[#1E293B] border-white/10 rounded-xl shadow-2xl">
                                    <div className="py-1">{opcoesFiltro.map(op => (
                                        <button key={op.value} onClick={() => { setFiltroStatus(op.value); setDropdownOpen(false) }} className={`w-full text-left px-4 py-3 flex items-center gap-3 ${filtroStatus === op.value? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-white'}`}>
                                            <op.icon className="w-5 h-5" /><span>{op.label}</span>
                                        </button>
                                    ))}</div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleOpenCreate} className="w-full sm:w-1/2 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-5 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/30 transition">
                            <Plus className="w-5 h-5" /> Nova Escola
                        </button>
                    </div>

                    <div className="md:hidden overflow-x-auto flex gap-4 pb-2">
                        {stats.map((stat, i) => <div key={i} className="w-full flex-shrink-0"><StatCard {...stat} /></div>)}
                    </div>
                    <div className="hidden md:grid md:grid-cols-3 gap-6">{stats.map((stat, i) => <StatCard key={i} {...stat} />)}</div>

                    <div>
                        {loading? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" /></div> :
                        escolas.length === 0? <div className="bg-white/5 rounded-2xl p-10 text-center"><School className="w-12 h-12 text-gray-500 mx-auto mb-3" /><p className="text-gray-400">Nenhuma escola encontrada</p></div> :
                        <>
                            <div className="md:hidden overflow-x-auto flex gap-4 pb-2">{escolas.map((escola) => <div key={escola.id} className="w-full flex-shrink-0"><EscolaCard escola={escola} onEdit={() => handleOpenEdit(escola)} onDelete={() => handleDeleteClick(escola.id)} /></div>)}</div>
                            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-5">{escolas.map((escola) => <EscolaCard key={escola.id} escola={escola} onEdit={() => handleOpenEdit(escola)} onDelete={() => handleDeleteClick(escola.id)} />)}</div>
                        </>}
                    </div>
                </div>

                {/* MODAIS */}
                <EscolaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEscola} escola={escolaEditando} saving={saving} />
                <ConfirmDeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete} />
                <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleConfirmLogout} />
            </main>
        </div>
    )
}
