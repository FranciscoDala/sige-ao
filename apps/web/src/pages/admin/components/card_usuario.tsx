import { Eye, Edit, Trash2, ShieldCheck, Mail, Phone, Building } from 'lucide-react' // 👈 ADD Building AQUI
import { UsuarioMinisterio } from '../../types/usuario'

interface UsuarioCardProps {
    usuario: UsuarioMinisterio
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}

export default function UsuarioCard({ usuario, onView, onEdit, onDelete }: UsuarioCardProps) {
    return (
        <div className="group bg-white/5 backdrop-blur-2xl border-white/10 rounded-2xl p-5 hover:border-[#3B82F6]/60 hover:bg-white/10 transition-all duration-300 w-full snap-center shrink-0 shadow-lg">
            <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/20 mt-1 overflow-hidden">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg leading-tight break-words">{usuario.nome}</h3>
                            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-red-500/20 text-red-400 border-red-500/30">Super Admin</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${usuario.ativo? 'bg-green-400' : 'bg-gray-500'}`} />
                    </div>

                    <div className="space-y-1.5 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                            <span className="break-words">{usuario.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Building className="w-4 h-4 text-[#3B82F6] flex-shrink-0" /> {/* 👈 AGORA VAI FUNCIONAR */}
                            <span>Ministério</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <ShieldCheck className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                            <span>{usuario.ativo? 'Ativo' : 'Inativo'}</span>
                        </div>
                        {usuario.telefone && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Phone className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                                <span>{usuario.telefone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                <button onClick={onView} className="w-full flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 border-white/10 rounded-lg text-sm text-gray-300 font-semibold transition">
                    <Eye className="w-4 h-4" /> Ver
                </button>
                <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 border-[#8B5CF6]/20 rounded-lg text-sm text-[#8B5CF6] font-semibold transition">
                    <Edit className="w-4 h-4" /> Editar
                </button>
                <button onClick={onDelete} className="w-full flex items-center justify-center p-2.5 bg-red-500/15 hover:bg-red-500/30 border-red-500/20 rounded-lg text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
