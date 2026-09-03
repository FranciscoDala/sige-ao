import { ShoppingBag, Users, UserPlus, UserMinus, ArrowUpRight, Plus, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react'

const StatCard = ({ icon, title, value, percent, color }: any) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#F0F4F3] rounded-xl flex items-center justify-center">{icon}</div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold">{value}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${color === 'green' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{percent}</span>
        </div>
        <p className="text-sm text-gray-500">{title}</p>
    </div>
)

export default function Dashboard() {
    return (
        <div className="space-y-6">

            {/* 4 CARDS + ADD WIDGET */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={<ShoppingBag className="w-5 h-5 text-[#0B4D3F]" />} title="Total de Escolas" value="310" percent="+ 3.72%" color="green" />
                <StatCard icon={<Users className="w-5 h-5 text-[#0B4D3F]" />} title="Total Usuários" value="1,244" percent="+ 5.02%" color="green" />
                <StatCard icon={<UserPlus className="w-5 h-5 text-[#0B4D3F]" />} title="Novas Matrículas" value="1,298" percent="- 1.72%" color="amber" />
                <StatCard icon={<UserMinus className="w-5 h-5 text-[#0B4D3F]" />} title="Desligamentos" value="98" percent="- 3.72%" color="amber" />

                <button className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#0B4D3F]">
                    <div className="w-10 h-10 bg-[#0B4D3F] rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium">Add new widget</p>
                </button>
            </div>

            {/* 3 COLUNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Active Jobs -> Escolas Ativas */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-bold">Escolas Ativas</p>
                            <p className="text-2xl font-bold">24 <span className="text-sm font-normal text-gray-500">Escolas</span></p>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
                            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ArrowRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                            <div>
                                <p className="font-semibold text-sm">Escola Mutamba {i}</p>
                                <p className="text-xs text-gray-500">Luanda - Pública</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Interviews -> Próximas Reuniões */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-bold">Próximas Reuniões</p>
                            <p className="text-2xl font-bold">12 <span className="text-sm font-normal text-gray-500">Reuniões</span></p>
                        </div>
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/40?u=${i}`} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-sm">Reunião Pedagógica</p>
                                    <p className="text-xs text-gray-500">Diretor Geral</p>
                                </div>
                            </div>
                            <span className="text-xs bg-[#F0F4F3] px-3 py-1.5 rounded-full">Seg 12, 2026 - 10:00</span>
                        </div>
                    ))}
                </div>

                {/* Employment Status -> Status de Usuários */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-bold">Status de Usuários</p>
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex justify-between mb-4">
                        <p className="text-sm text-gray-500">Total de Usuários</p>
                        <p className="font-bold">3109</p>
                    </div>
                    <div className="flex gap-1 h-2 mb-4 rounded-full overflow-hidden">
                        <div className="bg-[#0B4D3F] w-1/3"></div>
                        <div className="bg-[#0D9488] w-1/4"></div>
                        <div className="bg-[#2DD4BF] w-1/5"></div>
                        <div className="bg-[#99F6E4] w-1/6"></div>
                        <div className="bg-[#CCFBF1] flex-1"></div>
                    </div>
                    {['Diretores', 'Professores', 'Secretários', 'Administrativos', 'Alunos'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#0B4D3F]"></div>
                                <p className="text-sm">{item}</p>
                            </div>
                            <p className="font-semibold">3109</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
