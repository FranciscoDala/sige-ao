import { TrendingUp, TrendingDown, Users, Building2, GraduationCap, DollarSign, ArrowUpRight } from 'lucide-react'

const KpiCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-5 hover:border-[#00D4AA]/30 transition">
        <div className="flex justify-between items-start mb-4">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="w-10 h-10 bg-[#1A1A1D] rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#00D4AA]" />
            </div>
        </div>
        <p className="text-3xl font-bold text-white mb-2">{value}</p>
        <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}% vs mês anterior</span>
        </div>
    </div>
)

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
                <p className="text-gray-400 text-sm">Dados em tempo real do sistema SIGE</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard title="Total de Escolas" value="248" change="+12" icon={Building2} trend={12} />
                <KpiCard title="Total de Alunos" value="84.2K" change="+5.2%" icon={GraduationCap} trend={5.2} />
                <KpiCard title="Usuários Ativos" value="3,109" change="+3.7%" icon={Users} trend={3.7} />
                <KpiCard title="Receita Mensal" value="KZ 12.4M" change="-1.2%" icon={DollarSign} trend={-1.2} />
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* GRÁFICO */}
                <div className="xl:col-span-2 bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <p className="font-bold text-white">Matrículas por Mês</p>
                        <button className="text-xs text-[#00D4AA] hover:underline">Ver relatório completo</button>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 60, 55, 75, 65, 90, 80, 95, 85, 100, 90, 110].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-[#00D4AA] to-[#00A884] rounded-t-md hover:opacity-80" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* ATIVIDADE RECENTE */}
                <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
                    <p className="font-bold text-white mb-4">Atividade Recente</p>
                    <div className="space-y-4">
                        {[
                            { a: 'Escola Mutamba', b: 'Nova matrícula: 32 alunos' },
                            { a: 'Complexo Futungo', b: 'Relatório mensal enviado' },
                            { a: 'Escola do Futuro', b: '3 professores adicionados' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-2 h-2 bg-[#00D4AA] rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{item.a}</p>
                                    <p className="text-xs text-gray-400">{item.b}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TABELA */}
            <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <p className="font-bold text-white">Top 5 Escolas</p>
                    <button className="text-xs text-[#00D4AA] hover:underline flex items-center gap-1">Ver todas <ArrowUpRight className="w-3 h-3" /></button>
                </div>
                <table className="w-full text-sm">
                    <thead className="text-left text-gray-400 border-b border-[#1F1F22]">
                        <tr>
                            <th className="pb-3 font-medium">Escola</th>
                            <th className="pb-3 font-medium">Alunos</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Crescimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { nome: 'Escola Mutamba', alunos: '2,340', status: 'Ativa', cresc: '+12%' },
                            { nome: 'Complexo Futungo', alunos: '1,890', status: 'Ativa', cresc: '+8%' },
                            { nome: 'Escola do Futuro', alunos: '1,540', status: 'Ativa', cresc: '+15%' },
                        ].map((s, i) => (
                            <tr key={i} className="border-b border-[#1F1F22] last:border-0">
                                <td className="py-4 text-white font-medium">{s.nome}</td>
                                <td className="py-4 text-gray-300">{s.alunos}</td>
                                <td className="py-4"><span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-md text-xs">{s.status}</span></td>
                                <td className="py-4 text-green-400">{s.cresc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
