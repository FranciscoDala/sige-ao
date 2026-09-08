import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
    Building2, Users, MapPin, TrendingUp, Trash2, Plus,
    ChevronDown, Loader2, School, LayoutDashboard
} from 'lucide-react'
import { toast } from 'sonner'
import StatCard from './components/card_stat'
import EscolaCard from './components/card_escolas'
import EscolaModal, { Escola } from './components/modal_escola'
import EscolaViewModal from './components/modal_escolaView'
import ConfirmDeleteModal from './components/modal_confirmDelete'
import ConfirmLogoutModal from './components/modal_confirmLogout'
import { UsuarioMinisterio } from '../types/usuario'

const API_URL = import.meta.env.VITE_API_URL

const getToken = (): string | null => localStorage.getItem('access_token');

const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export default function Dashboard() {
    const [filtroStatus, setFiltroStatus] = useState('todas')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [usuarios, setUsuarios] = useState<UsuarioMinisterio[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [escolaEditando, setEscolaEditando] = useState<Escola | null>(null)
    const [saving, setSaving] = useState(false)

    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [escolaVisualizando, setEscolaVisualizando] = useState<Escola | null>(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [escolaParaDeletar, setEscolaParaDeletar] = useState<string | null>(null)
    const [logoutOpen, setLogoutOpen] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (dropdownRef.current &&!dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchDados = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (filtroStatus === 'ativa') params.ativo = true
            if (filtroStatus === 'inativa') params.ativo = false

            const [resEscolas, resUsuarios] = await Promise.all([
                api.get<Escola[]>(`/escolas`, { params }),
                api.get<UsuarioMinisterio[]>(`/usuarios`)
            ])

            setEscolas(resEscolas.data)
            setUsuarios(resUsuarios.data)
        } catch (err: any) {
            toast.error(`Erro ao carregar dados: ${err.response?.data?.detail || err.message}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDados() }, [filtroStatus])

    const handleSaveEscola = async (
        data: Partial<Escola> & { id_curto?: string },
        id?: string,
        logoFile?: File
    ) => {
        setSaving(true)
        try {
            let escolaId = id
            let res

            if (id) {
                res = await api.put(`/escolas/${id}`, data)
            } else {
                res = await api.post(`/escolas`, data)
            }
            escolaId = res.data.id

            if (logoFile && escolaId) {
                const formData = new FormData()
                formData.append('logo', logoFile)
                await api.post(`/escolas/${escolaId}/logo`, formData)
            }

            toast.success(id? "Escola atualizada!" : "Escola criada!")
            setModalOpen(false)
            setEscolaEditando(null)
            fetchDados()
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                const msg = detail.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ')
                toast.error(msg)
            } else {
                toast.error(detail || "Erro ao salvar escola")
            }
        } finally {
            setSaving(false)
        }
    }

    const handleOpenCreate = () => { setEscolaEditando(null); setModalOpen(true) }
    const handleOpenEdit = (escola: Escola) => { setEscolaEditando(escola); setModalOpen(true) }
    const handleOpenView = (escola: Escola) => { setEscolaVisualizando(escola); setViewModalOpen(true) }
    const handleDeleteClick = (id: string) => { setEscolaParaDeletar(id); setConfirmOpen(true) }

    const handleConfirmDelete = async () => {
        if (!escolaParaDeletar) return
        try {
            await api.delete(`/escolas/${escolaParaDeletar}`)
            toast.success("Escola desativada")
            fetchDados()
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

    return (
        <div className="space-y-4">
            {/* HEADER IGUAL DEFINICOES */}
            <div className="flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-[#3B82F6]" />
                <div>
                    <h1 className="text-xl font-bold text-white">Painel</h1>
                    <p className="text-xs text-gray-400">Gerencie todas as escolas cadastradas</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div ref={dropdownRef} className="relative w-full sm:w-1/2">
                    <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200 text-sm">
                        <div className="flex items-center gap-2 truncate">{opcaoSelecionada && <opcaoSelecionada.icon className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />}<span className="truncate">{opcaoSelecionada?.label}</span></div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${dropdownOpen? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-[#1E293B]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
                            <div className="max-h-60 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{opcoesFiltro.map(op => (
                                <button key={op.value} type="button" onClick={() => { setFiltroStatus(op.value); setDropdownOpen(false) }} className={`w-full text-left px-3 py-2.5 hover:bg-white/10 transition flex items-center gap-3 text-sm ${filtroStatus === op.value? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-gray-300 hover:text-white'}`}>
                                    <op.icon className="w-4 h-4 flex-shrink-0" /><span>{op.label}</span>
                                    {filtroStatus === op.value && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></div>}
                                </button>
                            ))}</div>
                        </div>
                    )}
                </div>

                <div className="w-full sm:w-1/2 flex items-end">
                    <button onClick={handleOpenCreate} className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/30 transition text-sm">
                        <Plus className="w-4 h-4" /> Adicionar Escola
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-3 pb-2 px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {stats.map((stat, i) => <div key={i} className="w-full flex-shrink-0"><StatCard {...stat} /></div>)}
            </div>

            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
            </div>

            <div>
                {loading? <div className="flex justify-center items-center py-16"><Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" /></div> :
                    escolas.length === 0? <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"><School className="w-10 h-10 text-gray-500 mx-auto mb-3" /><p className="text-gray-400 text-sm">Nenhuma escola encontrada com este filtro.</p></div> :
                        <>
                            <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-3 pb-2 px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {escolas.map((escola) => {
                                    const diretor = usuarios.find(u => u.nivel === 'DIRETOR' && u.escola_id === escola.id)
                                    return (
                                        <div key={escola.id} className="w-full flex-shrink-0">
                                            <EscolaCard
                                                escola={escola}
                                                diretor={diretor}
                                                onView={() => handleOpenView(escola)}
                                                onEdit={() => handleOpenEdit(escola)}
                                                onDelete={() => handleDeleteClick(escola.id)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {escolas.map((escola) => {
                                    const diretor = usuarios.find(u => u.nivel === 'DIRETOR' && u.escola_id === escola.id)
                                    return (
                                        <EscolaCard
                                            key={escola.id}
                                            escola={escola}
                                            diretor={diretor}
                                            onView={() => handleOpenView(escola)}
                                            onEdit={() => handleOpenEdit(escola)}
                                            onDelete={() => handleDeleteClick(escola.id)}
                                        />
                                    )
                                })}
                            </div>
                        </>
                }
            </div>

            <EscolaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEscola} escola={escolaEditando} saving={saving} />
            <EscolaViewModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} escola={escolaVisualizando} />
            <ConfirmDeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete} />
            <ConfirmLogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleConfirmLogout} />
        </div>
    )
}
