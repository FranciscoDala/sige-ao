import { TrendingUp, LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    color: string
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 hover:border-white/20 transition-all duration-300 w-full snap-center shrink-0">
            <div className="flex items-center justify-between">
                <div>
                    {/* TEXTO MENOR: text-sm -> text-xs | MB MENOR: mb-1 -> mb-0.5 */}
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{title}</p>
                    {/* VALOR MENOR: text-3xl -> text-2xl */}
                    <p className="text-2xl font-bold text-white leading-none">{value}</p>
                    {/* TREND MENOR: mt-2 -> mt-1.5 text-xs -> [11px] icon w-3.5 -> w-3 */}
                    <div className="flex items-center gap-1 text-[11px] text-green-400 mt-1.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12% este mês</span>
                    </div>
                </div>

                {/* ICONE MENOR: w-10 h-10 -> w-9 h-9 | rounded-xl | icon w-5 -> w-4 */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    )
}
