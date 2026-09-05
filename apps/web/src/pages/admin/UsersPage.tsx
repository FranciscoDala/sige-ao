import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
    Users, UserCheck, UserX, ShieldCheck, Trash2, Plus,
    ChevronDown, Loader2, Building
} from 'lucide-react'
import { toast } from 'sonner'
import { UsuarioMinisterio } from '../types/usuario' // 👈 1. IMPORT DA INTERFACE AQUI
import StatCard from './components/card_stat'
import UsuarioCard from './components/card_usuario'
import UsuarioModal from './components/modal_usuario' // 👈 2. TIREI O { UsuarioMinisterio } daqui
import UsuarioViewModal from './components/modal_usuarioView'
import ConfirmDeleteModal from './components/modal_confirmDelete'

const API_URL = import.meta.env.VITE_API_URL

const getToken = (): string | null => localStorage.getItem('access_token');

const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export default function UsersPage() {
    const [filtroStatus, setFiltroStatus] = useState('todos')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [usuarios, setUsuarios] = useState<UsuarioMinisterio[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [usuarioEditando, setUsuarioEditando] = useState<UsuarioMinisterio | null>(null)
    const [saving, setSaving] = useState(false)

    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [usuarioVisualizando, setUsuarioVisualizando] = useState<UsuarioMinisterio | null>(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<string | null>(null)

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (dropdownRef.current &&!dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const params: any = { tipo: 'ministerio' }
            if (filtroStatus === 'ativo') params.ativo = true
            if (filtroStatus === 'inativo') params.ativo = false
            if (filtroStatus === 'admin') params.perfil = 'admin'
            const res = await api.get<UsuarioMinisterio[]>(`/usuarios`, { params })
            setUsuarios(res.data)
        } catch (err: any) {
            toast.error(`Erro ao carregar usuários: ${err.response?.data?.detail || err.message}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsuarios() }, [filtroStatus])

    const handleSaveUsuario = async (data: FormData) => { // 👈 3. REMOVI O id pq a modal só cria
        setSaving(true)
        try {
            data.append('tipo', 'ministerio')
            await api.post(`/usuarios`, data) // 👈 só POST
            toast.success("Usuário criado!")
            setModalOpen(false)
            fetchUsuarios()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erro ao salvar usuário")
        } finally {
            setSaving(false)
        }
    }

    const handleOpenCreate = () => { setUsuarioEditando(null); setModalOpen(true) }
    const handleOpenEdit = (usuario: UsuarioMinisterio) => { toast.info("Edição de usuário do ministério desativada") } // 👈 4. DESATIVEI EDIT
    const handleOpenView = (usuario: UsuarioMinisterio) => { setUsuarioVisualizando(usuario); setViewModalOpen(true) }
    const handleDeleteClick = (id: string) => { setUsuarioParaDeletar(id); setConfirmOpen(true) }

    const handleConfirmDelete = async () => {
        if (!usuarioParaDeletar) return
        try {
            await api.delete(`/usuarios/${usuarioParaDeletar}`)
            toast.success("Usuário desativado")
            fetchUsuarios()
        } catch {
            toast.error("Erro ao desativar")
        } finally {
            setConfirmOpen(false)
            setUsuarioParaDeletar(null)
        }
    }

    const opcoesFiltro = [
        { value: 'todos', label: 'Todos do Ministério', icon: Users },
        { value: 'ativo', label: 'Apenas Ativos', icon: UserCheck },
        { value: 'inativo', label: 'Apenas Inativos', icon: UserX },
        { value: 'admin', label: 'Apenas Admins', icon: ShieldCheck },
    ]
    const opcaoSelecionada = opcoesFiltro.find(o => o.value === filtroStatus)

    const stats = [
        { title: "Total Ministério", value: usuarios.length, icon: Users, color: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" },
        { title: "Usuários Ativos", value: usuarios.filter(u => u.ativo).length, icon: UserCheck, color: "bg-gradient-to-br from-[#10B981] to-[#059669]" },
        { title: "Super Admins", value: usuarios.filter(u => u.perfil === 'super_admin').length, icon: ShieldCheck, color: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Usuários Ministério</h2>
                <p className="text-gray-400">Gerencie quem pode acessar o painel administrativo</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div ref={dropdownRef} className="relative w-full sm:w-1/2">
                    <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center gap-3 truncate">{opcaoSelecionada && <opcaoSelecionada.icon className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />}<span className="truncate">{opcaoSelecionada?.label}</span></div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${dropdownOpen? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-[#1E293B]/90 backdrop-blur-2xl border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
                            <div className="max-h-60 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{opcoesFiltro.map(op => (
                                <button key={op.value} type="button" onClick={() => { setFiltroStatus(op.value); setDropdownOpen(false) }} className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${filtroStatus === op.value? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-gray-300 hover:text-white'}`}>
                                    <op.icon className="w-5 h-5 flex-shrink-0" /><span>{op.label}</span>
                                    {filtroStatus === op.value && <div className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6]"></div>}
                                </button>
                            ))}</div>
                        </div>
                    )}
                </div>

                <div className="w-full sm:w-1/2 flex items-end">
                    <button onClick={handleOpenCreate} className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-5 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/30 transition">
                        <Plus className="w-5 h-5" /> Adicionar Usuário
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-2 px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {stats.map((stat, i) => <div key={i} className="w-full flex-shrink-0"><StatCard {...stat} /></div>)}
            </div>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
            </div>

            <div>
                {loading? <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" /></div> :
                    usuarios.length === 0? <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-10 text-center"><Building className="w-12 h-12 text-gray-500 mx-auto mb-3" /><p className="text-gray-400">Nenhum usuário do Ministério encontrado.</p></div> :
                        <>
                            <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-2 px-4 -mx-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {usuarios.map((usuario) => (
                                    <div key={usuario.id} className="w-full flex-shrink-0">
                                        <UsuarioCard
                                            usuario={usuario}
                                            onView={() => handleOpenView(usuario)}
                                            onEdit={() => handleOpenEdit(usuario)}
                                            onDelete={() => handleDeleteClick(usuario.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {usuarios.map((usuario) =>
                                    <UsuarioCard
                                        key={usuario.id}
                                        usuario={usuario}
                                        onView={() => handleOpenView(usuario)}
                                        onEdit={() => handleOpenEdit(usuario)}
                                        onDelete={() => handleDeleteClick(usuario.id)}
                                    />
                                )}
                            </div>
                        </>
                }
            </div>

            <UsuarioModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveUsuario} usuario={usuarioEditando} saving={saving} />
            <UsuarioViewModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} usuario={usuarioVisualizando} />
            <ConfirmDeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete} />
        </div>
    )
}
