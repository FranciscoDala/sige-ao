import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
    Building2, Users, MapPin, TrendingUp, Eye, Edit, Trash2, Plus,
    ChevronDown, Loader2, School, Phone, Mail, MapPinIcon
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL

interface Escola {
    id: string
    nome: string
    sigla?: string
    provincia?: string
    municipio?: string
    telefone?: string
    email?: string
    logo_url?: string
    ativo: boolean
    alunos?: number // se tu tiver essa contagem na API depois
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6 hover:border-white/20 hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <p className="text-sm text-gray-400">{title}</p>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <p className="text-4xl font-bold text-white mb-1">{value}</p>
        <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>+12% este mês</span>
        </div>
    </div>
)

// CARD DA ESCOLA - BRABO
const EscolaCard = ({ escola, onEdit, onDelete }: { escola: Escola, onEdit: () => void, onDelete: () => void }) => (
    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-[#3B82F6]/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">

        {/* HEADER DO CARD */}
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center flex-shrink-0">
                    {escola.logo_url ?
                        <img src={escola.logo_url} alt={escola.nome} className="w-full h-full object-cover rounded-xl" /> :
                        <School className="w-6 h-6 text-white" />
                    }
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{escola.nome}</h3>
                    <p className="text-xs text-gray-400">{escola.sigla || `ID: ${escola.id}`}</p>
                </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${escola.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                {escola.ativo ? 'Ativa' : 'Inativa'}
            </span>
        </div>

        {/* INFOS */}
        <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPinIcon className="w-4 h-4 text-[#3B82F6]" />
                <span>{escola.provincia || 'N/A'} - {escola.municipio || 'N/A'}</span>
            </div>
            {escola.email && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-[#3B82F6]" />
                    <span className="truncate">{escola.email}</span>
                </div>
            )}
            {escola.telefone && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-[#3B82F6]" />
                    <span>{escola.telefone}</span>
                </div>
            )}
        </div>

        {/* AÇÕES */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
            <button className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-[#3B82F6]/20 rounded-lg text-sm transition">
                <Eye className="w-4 h-4" /> Ver
            </button>
            <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-[#8B5CF6]/20 rounded-lg text-sm transition">
                <Edit className="w-4 h-4" /> Editar
            </button>
            <button onClick={onDelete} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-lg transition">
                <Trash2 className="w-4 h-4 text-red-400" />
            </button>
        </div>
    </div>
)

export default function Dashboard() {
    const [filtroStatus, setFiltroStatus] = useState('todas') // todas, ativa, inativa
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // BUSCAR ESCOLAS DO DB
    useEffect(() => {
        const fetchEscolas = async () => {
            setLoading(true)
            try {
                const params: any = {}
                if (filtroStatus === 'ativa') params.ativo = true
                if (filtroStatus === 'inativa') params.ativo = false

                const res = await axios.get<Escola[]>(`${API_URL}/escolas`, { params })
                setEscolas(res.data)
            } catch (err: any) {
                toast.error(`Erro ao carregar escolas: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }
        fetchEscolas()
    }, [filtroStatus]) // recarrega quando muda o filtro

    const opcoesFiltro = [
        { value: 'todas', label: 'Todas as Escolas', icon: Building2 },
        { value: 'ativa', label: 'Apenas Ativas', icon: TrendingUp },
        { value: 'inativa', label: 'Apenas Inativas', icon: Trash2 },
    ]

    const handleAddEscola = () => {
        console.log('Abrir modal de nova escola')
    }

    const handleEdit = (id: string) => toast.info(`Editar escola ${id}`)
    const handleDelete = (id: string) => toast.warning(`Desativar escola ${id}`)

    const opcaoSelecionada = opcoesFiltro.find(o => o.value === filtroStatus)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Painel do Super Admin</h2>
                <p className="text-gray-400">Gerencie todas as escolas cadastradas no SIGE</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Escolas" value={escolas.length} icon={Building2} color="bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" />
                <StatCard title="Escolas Ativas" value={escolas.filter(e => e.ativo).length} icon={Users} color="bg-gradient-to-br from-[#10B981] to-[#059669]" />
                <StatCard title="Províncias" value={new Set(escolas.map(e => e.provincia)).size} icon={MapPin} color="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]" />
            </div>

            {/* AÇÕES: DROPDOWN CUSTOM + BTN 50/50 */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div ref={dropdownRef} className="relative w-full sm:w-1/2">
                    <label className="text-sm text-gray-400 mb-2 block">Filtrar por Status</label>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:border-white/20 transition"
                    >
                        <div className="flex items-center gap-3 truncate">
                            {opcaoSelecionada && <opcaoSelecionada.icon className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />}
                            <span className="truncate">{opcaoSelecionada?.label}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-[#1E293B]/80 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl overflow-hidden">
                            <div className="max-h-60 overflow-y-auto py-1">
                                {opcoesFiltro.map(op => (
                                    <button
                                        key={op.value}
                                        type="button"
                                        onClick={() => { setFiltroStatus(op.value); setDropdownOpen(false) }}
                                        className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${filtroStatus === op.value ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-white'}`}
                                    >
                                        <op.icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{op.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full sm:w-1/2 flex items-end">
                    <button
                        onClick={handleAddEscola}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-5 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/30 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Escola
                    </button>
                </div>
            </div>

            {/* LISTA DE CARDS */}
            <div>
                <p className="font-bold text-white text-lg mb-4">
                    Escolas Cadastradas
                    <span className="text-sm font-normal text-gray-400 ml-2">({escolas.length} encontradas)</span>
                </p>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                    </div>
                ) : escolas.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-10 text-center">
                        <School className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhuma escola encontrada com este filtro.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {escolas.map((escola) => (
                            <EscolaCard
                                key={escola.id}
                                escola={escola}
                                onEdit={() => handleEdit(escola.id)}
                                onDelete={() => handleDelete(escola.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
