import { useState, useEffect, useRef } from 'react'
import { Building2, Users, MapPin, TrendingUp, Eye, Edit, Trash2, Plus, ChevronDown, Filter } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
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

export default function Dashboard() {
    const [filtroStatus, setFiltroStatus] = useState('todas')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const opcoesFiltro = [
        { value: 'todas', label: 'Todas as Escolas', icon: Building2 },
        { value: 'ativa', label: 'Apenas Ativas', icon: TrendingUp },
        { value: 'inativa', label: 'Apenas Inativas', icon: Trash2 },
        { value: 'pendente', label: 'Pendentes', icon: Eye },
    ]

    const escolas = [
        { id: 1, nome: 'Escola Mutamba', provincia: 'Luanda', alunos: 2340, status: 'ativa' },
        { id: 2, nome: 'Complexo Escolar Futungo', provincia: 'Luanda', alunos: 1890, status: 'ativa' },
        { id: 3, nome: 'Escola do Futuro', provincia: 'Benguela', alunos: 1540, status: 'pendente' },
        { id: 4, nome: 'Escola do Kilamba', provincia: 'Luanda', alunos: 980, status: 'inativa' },
    ]

    const escolasFiltradas = escolas.filter(e =>
        filtroStatus === 'todas' ? true : e.status === filtroStatus
    )

    const handleAddEscola = () => {
        console.log('Abrir modal de nova escola')
    }

    const opcaoSelecionada = opcoesFiltro.find(o => o.value === filtroStatus)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Painel do Super Admin</h2>
                <p className="text-gray-400">Gerencie todas as escolas cadastradas no SIGE</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Escolas" value="248" icon={Building2} color="bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" />
                <StatCard title="Usuários Totais" value="84.2K" icon={Users} color="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]" />
                <StatCard title="Províncias Atendidas" value="18" icon={MapPin} color="bg-gradient-to-br from-[#10B981] to-[#059669]" />
            </div>

            {/* AÇÕES: DROPDOWN CUSTOM + BTN 50/50 */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">

                {/* DROPDOWN CUSTOM */}
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
                        <div className="absolute z-10 w-full mt-2 bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
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

                {/* BTN ADICIONAR */}
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

            {/* TABELA */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6">
                <p className="font-bold text-white text-lg mb-4">
                    Escolas
                    <span className="text-sm font-normal text-gray-400 ml-2">({escolasFiltradas.length} encontradas)</span>
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="text-left text-gray-400 text-xs uppercase border-b border-white/10">
                            <tr>
                                <th className="pb-3 font-semibold">Escola</th>
                                <th className="pb-3 font-semibold">Província</th>
                                <th className="pb-3 font-semibold">Alunos</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {escolasFiltradas.map((e) => (
                                <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                    <td className="py-4">
                                        <p className="text-white font-semibold">{e.nome}</p>
                                        <p className="text-xs text-gray-400">ID: #ESC{e.id.toString().padStart(4, '0')}</p>
                                    </td>
                                    <td className="py-4 text-gray-300">{e.provincia}</td>
                                    <td className="py-4 text-gray-300">{e.alunos.toLocaleString()}</td>
                                    <td className="py-4">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${e.status === 'ativa' ? 'bg-green-500/20 text-green-400' :
                                                e.status === 'inativa' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {e.status === 'ativa' ? 'Ativa' : e.status === 'inativa' ? 'Inativa' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex gap-2 justify-end">
                                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Eye className="w-4 h-4 text-gray-300" /></button>
                                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4 text-gray-300" /></button>
                                            <button className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
