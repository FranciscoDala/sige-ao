import { TrendingUp, LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    color: string
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6 hover:border-white/20 hover:scale-[1.02] transition-all duration-300 w-full snap-center shrink-0">
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
}
