import { TrendingUp, LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    color: string
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-300 w-full snap-center shrink-0">
            {/* Linha 1: Título + Ícone */}
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400 font-medium">{title}</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Linha 2: Valor + Trend embaixo */}
            <div>
                <p className="text-3xl font-bold text-white leading-none">{value}</p>
                <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12% este mês</span>
                </div>
            </div>
        </div>
    )
}
