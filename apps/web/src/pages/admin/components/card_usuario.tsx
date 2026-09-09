import { Eye, Edit, Trash2, User, Mail, Phone, Building } from 'lucide-react'
import { UsuarioMinisterio } from '../../types/usuario'

interface UsuarioCardProps {
    usuario: UsuarioMinisterio
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}

const getNivelLabel = (nivel: string) => {
    if (nivel === 'MINISTERIO') return 'Super Admin'
    if (nivel === 'DIRETOR') return 'Diretor'
    return 'Usuário'
}

const getNivelColor = (nivel: string) => {
    if (nivel === 'MINISTERIO') return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (nivel === 'DIRETOR') return 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30'
    return 'bg-white/10 text-gray-300 border-white/20'
}

export default function UsuarioCard({ usuario, onView, onEdit, onDelete }: UsuarioCardProps) {
    const isDiretor = usuario.nivel === 'DIRETOR'

    return (
        <div className="group bg-white/5 backdrop-blur-2xl border-white/10 rounded-2xl p-4 hover:border-[#3B82F6]/60 hover:bg-white/10 transition-all duration-300 w-[85vw] max-w-sm snap-center shrink-0 shadow-lg md:w-full">
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5 overflow-hidden ${
                    isDiretor? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-[#8B5CF6]/20' : 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-[#3B82F6]/20'
                }`}>
                    <User className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-base leading-tight break-words">{usuario.nome}</h3>
                            <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold border mt-1 ${getNivelColor(usuario.nivel)}`}>
                                {getNivelLabel(usuario.nivel)}
                            </span>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${usuario.ativo? 'bg-green-400' : 'bg-gray-500'}`} />
                    </div>

                    <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                            <span className="break-words truncate">{usuario.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Building className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                            <span>{usuario.departamento || (isDiretor? 'Escola' : 'Ministério')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <User className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                            <span>{usuario.ativo? 'Ativo' : 'Inativo'}</span>
                        </div>
                        {usuario.telefone && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Phone className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0" />
                                <span>{usuario.telefone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <button onClick={onView} className="hidden w-full items-center justify-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 font-semibold transition">
                    <Eye className="w-3.5 h-3.5" /> Ver
                </button>
                <button onClick={onEdit} className="w-full flex items-center justify-center gap-1.5 p-2 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 rounded-lg text-xs text-[#8B5CF6] font-semibold transition">
                    <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={onDelete} className="w-full flex items-center justify-center gap-1.5 p-2 bg-red-500/15 hover:bg-red-500/30 border-red-500/20 rounded-lg text-xs text-red-400 font-semibold transition">
                    <Trash2 className="w-3.5 h-3.5" /> Apagar
                </button>
            </div>
        </div>
    )
}
