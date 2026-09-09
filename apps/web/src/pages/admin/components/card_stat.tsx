import { TrendingUp, LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    color: string
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-3 hover:border-white/20 transition-all duration-300 w-[calc(100vw-2rem)] snap-center shrink-0 md:w-full">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{title}</p>
                    <p className="text-2xl font-bold text-white leading-none">{value}</p>
                    <div className="flex items-center gap-1 text-[11px] text-green-400 mt-1.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12% este mês</span>
                    </div>
                </div>

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    )
}
