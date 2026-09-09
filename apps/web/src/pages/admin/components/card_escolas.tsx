import { Eye, Edit, Trash2, School, Phone, MapPinIcon, Hash, GraduationCap, User } from 'lucide-react'
import { Escola } from './modal_escola'
import { UsuarioMinisterio } from '../../types/usuario'

const NIVEL_LABELS: Record<string, string> = {
    "PRIMARIO": "Primário",
    "I_CICLO": "I Ciclo",
    "II_CICLO": "II Ciclo",
    "COMPLEXO": "Complexo",
    "MEDIO_TECNICO": "Médio Técnico",
    "SUPERIOR": "Superior"
}

interface EscolaCardProps {
    escola: Escola
    diretor?: UsuarioMinisterio | null
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}

export default function EscolaCard({ escola, diretor, onView, onEdit, onDelete }: EscolaCardProps) {
    return (
        <div className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 hover:border-[#3B82F6]/60 hover:bg-white/10 transition-all duration-300 w-[calc(100vw-2rem)] snap-center shrink-0 shadow-lg md:w-full">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/20 mt-0.5 overflow-hidden">
                    {escola.logo_url? (
                        <img src={escola.logo_url} alt={escola.nome} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <School className="w-5 h-5 text-white" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-base leading-tight break-words">{escola.nome}</h3>
                            <p className="text-xs text-[#3B82F6] font-semibold">{escola.sigla || `ID: ${escola.id}`}</p>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border flex-shrink-0 ${escola.ativo? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            {escola.ativo? 'Ativa' : 'Inativa'}
                        </span>
                    </div>

                    {escola.nivel_ensino && (
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30 font-semibold">
                                <GraduationCap className="w-3 h-3" />
                                {NIVEL_LABELS[escola.nivel_ensino] || escola.nivel_ensino}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                        <User className="w-3.5 h-3.5 text-[#8B5CF6] flex-shrink-0" />
                        <span className="truncate">Diretor: {diretor?.nome || 'Não definido'}</span>
                    </div>

                    <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <MapPinIcon className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                            <span className="break-words">{escola.provincia || 'N/A'} - {escola.municipio || 'N/A'}</span>
                        </div>
                        {escola.telefone && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Phone className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                                <span>{escola.telefone}</span>
                            </div>
                        )}
                        {escola.nif && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Hash className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                                <span>NIF: {escola.nif}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <button onClick={onView} className="hidden w-full items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border-white/10 rounded-lg text-xs text-gray-300 font-semibold transition">
                    <Eye className="w-3.5 h-3.5" /> Ver
                </button>
                <button onClick={onEdit} className="w-full flex items-center justify-center gap-1.5 p-2 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 border-[#8B5CF6]/20 rounded-lg text-xs text-[#8B5CF6] font-semibold transition">
                    <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={onDelete} className="w-full flex items-center justify-center gap-1.5 p-2 bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 rounded-lg text-xs text-red-400 font-semibold transition">
                    <Trash2 className="w-3.5 h-3.5" /> Apagar
                </button>
            </div>
        </div>
    )
}
