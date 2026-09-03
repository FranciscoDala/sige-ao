import { Building2, Users, MapPin, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-5 lg:p-6 hover:border-white/20 transition">
        <div className="flex justify-between items-start mb-4">
            <p className="text-sm text-gray-400">{title}</p>
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
        </div>
        <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{value}</p>
        <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>+12% este mês</span>
        </div>
    </div>
)

export default function Dashboard() {
    const escolas = [
        { id: 1, nome: 'Escola Mutamba', provincia: 'Luanda', alunos: 2340, status: 'Ativa', plano: 'Premium' },
        { id: 2, nome: 'Complexo Escolar Futungo', provincia: 'Luanda', alunos: 1890, status: 'Ativa', plano: 'Pro' },
        { id: 3, nome: 'Escola do Futuro', provincia: 'Benguela', alunos: 1540, status: 'Pendente', plano: 'Free' },
    ]

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">Painel do Super Admin</h2>
                <p className="text-gray-400 text-sm lg:text-base">Gerencie todas as escolas cadastradas no SIGE</p>
            </div>

            {/* KPIs - 1 coluna no mobile, 3 no desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatCard title="Total de Escolas" value="248" icon={Building2} color="bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" />
                <StatCard title="Usuários Totais" value="84.2K" icon={Users} color="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]" />
                <StatCard title="Províncias Atendidas" value="18" icon={MapPin} color="bg-gradient-to-br from-[#10B981] to-[#059669]" />
            </div>

            {/* TABELA - Com scroll horizontal no mobile */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <p className="font-bold text-white text-lg">Escolas Cadastradas</p>
                    <div className="flex gap-2">
                        <button className="text-xs bg-white/5 border-white/10 px-3 py-1.5 rounded-lg text-gray-300">Todas</button>
                        <button className="text-xs bg-[#3B82F6] px-3 py-1.5 rounded-lg text-white">Ativas</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="text-left text-gray-400 text-xs uppercase border-b border-white/10">
                            <tr>
                                <th className="pb-3 font-semibold">Escola</th>
                                <th className="pb-3 font-semibold">Província</th>
                                <th className="pb-3 font-semibold">Alunos</th>
                                <th className="pb-3 font-semibold">Plano</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {escolas.map((e) => (
                                <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                    <td className="py-4">
                                        <p className="text-white font-semibold text-sm">{e.nome}</p>
                                        <p className="text-xs text-gray-400">ID: #ESC{e.id.toString().padStart(4, '0')}</p>
                                    </td>
                                    <td className="py-4 text-gray-300 text-sm">{e.provincia}</td>
                                    <td className="py-4 text-gray-300 text-sm">{e.alunos.toLocaleString()}</td>
                                    <td className="py-4">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${e.plano === 'Premium' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' :
                                                e.plano === 'Pro' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>{e.plano}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${e.status === 'Ativa' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>{e.status}</span>
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
