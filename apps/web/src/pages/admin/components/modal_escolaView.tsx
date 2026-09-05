import { useEffect, MouseEvent } from 'react'
import { Building2, MapPin, Phone, FileText, Users, GraduationCap, BookOpen, Calendar, Edit, Eye, X } from 'lucide-react'
import { Escola } from './modal_escola'

interface Props {
    open: boolean
    onClose: () => void
    escola: Escola | null
    onEdit: (escola: Escola) => void // 👈 ACEITA A PROP PRA ABRIR A MODAL DE EDITAR
}

export default function EscolaViewModal({ open, onClose, escola, onEdit }: Props) {
    useEffect(() => {
        if (!open) return
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [open, onClose])

    if (!open ||!escola) return null

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    const handleEditClick = () => {
        onEdit(escola) // abre a modal de editar
        onClose() // fecha a modal de ver
    }

    // Stats mock - depois tu liga com a API real
    const stats = [
        { label: "Alunos", value: "1,240", icon: Users, color: "text-[#3B82F6]" },
        { label: "Professores", value: "86", icon: GraduationCap, color: "text-[#10B981]" },
        { label: "Turmas", value: "42", icon: BookOpen, color: "text-[#8B5CF6]" },
        { label: "Ano Letivo", value: "2026", icon: Calendar, color: "text-[#F59E0B]" },
    ]

    return (
        <div onClick={handleOverlayClick} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="w-full max-w-[720px] bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex-col max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* HEADER SEM BOTAO X */}
                <div className="p-5 pb-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                            {escola.logo_url?
                                <img src={escola.logo_url} className="w-full h-full object-cover" /> :
                                <Building2 className="w-8 h-8 text-[#3B82F6]" />
                            }
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white">{escola.nome}</h2>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    escola.ativo? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-red-500/15 text-red-400'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${escola.ativo? 'bg-[#10B981]' : 'bg-red-400'}`}></div>
                                    {escola.ativo? 'Ativa' : 'Inativa'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{escola.sigla} • ID: {escola.id}</p>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto py-4 px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-6">

                        {/* STATS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        <p className="text-xs text-gray-400">{stat.label}</p>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* DADOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 border-white/10 rounded-xl p-4 space-y-3">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3B82F6]" />Localização</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300"><span className="text-gray-500">Província:</span> {escola.provincia || '-'}</p>
                                    <p className="text-gray-300"><span className="text-gray-500">Município:</span> {escola.municipio || '-'}</p>
                                    <p className="text-gray-300"><span className="text-gray-500">Endereço:</span> {escola.endereco || '-'}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Phone className="w-4 h-4 text-[#3B82F6]" />Contato</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300"><span className="text-gray-500">Telefone:</span> {escola.telefone || '-'}</p>
                                    <p className="text-gray-300"><span className="text-gray-500">NIF:</span> {escola.nif || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* IDENTIDADE VISUAL */}
                        <div className="bg-white/5 border-white/10 rounded-xl p-4 space-y-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Eye className="w-4 h-4 text-[#3B82F6]" />Identidade Visual</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Cor Primária</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg border-white/10" style={{ backgroundColor: escola.cor_primaria }}></div>
                                        <span className="text-sm text-gray-300">{escola.cor_primaria}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Cor Secundária</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: escola.cor_secundaria }}></div>
                                        <span className="text-sm text-gray-300">{escola.cor_secundaria}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Tema</p>
                                    <span className="text-sm text-gray-300 capitalize bg-white/5 px-3 py-1 rounded-lg">{escola.tema}</span>
                                </div>
                            </div>
                        </div>

                        {/* AÇÕES RÁPIDAS */}
                        <div className="bg-white/5 border-white/10 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Ações Rápidas</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="flex items-center justify-center gap-2 h-10 bg-white/5 hover:bg-white/10 border-white/10 rounded-xl text-sm font-semibold text-gray-300 transition">
                                    <Users className="w-4 h-4" /> Usuários
                                </button>
                                <button className="flex items-center justify-center gap-2 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 transition">
                                    <BookOpen className="w-4 h-4" /> Turmas
                                </button>
                                <button className="flex items-center justify-center gap-2 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 transition">
                                    <FileText className="w-4 h-4" /> Relatórios
                                </button>
                                <button className="flex items-center justify-center gap-2 h-10 bg-white/5 hover:bg-white/10 border-white/10 rounded-xl text-sm font-semibold text-gray-300 transition">
                                    <Building2 className="w-4 h-4" /> Configurações
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER COM CANCELAR */}
                <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 shrink-0 bg-[#0F172A]/90">
                    <button
                        onClick={handleEditClick} // 👈 LIGA O EDITAR
                        className="w-full px-6 h-11 font-semibold rounded-xl bg-[#3B82F6]/15 hover:bg-[#3B82F6]/30 border border-[#3B82F6]/20 text-[#3B82F6] transition flex items-center justify-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Editar Escola
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 text-red-400 transition flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" /> Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
