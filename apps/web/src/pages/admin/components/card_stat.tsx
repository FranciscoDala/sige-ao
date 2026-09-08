import { TrendingUp, LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: StatCardProps) {
    return (
        <div className="w-full shrink-0 snap-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-0.5 text-xs font-medium text-gray-400">{title}</p>
                    <p className="text-2xl font-bold leading-none text-white">{value}</p>

                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-green-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>+12% este mês</span>
                    </div>
                </div>

                <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
        </div>
    );
}
