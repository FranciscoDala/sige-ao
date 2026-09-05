import { MouseEvent } from 'react'
import { X, User, Mail, ShieldCheck, Building, BadgeCheck, Calendar } from 'lucide-react'
import { UsuarioMinisterio } from '../../types/usuario'

interface UsuarioViewModalProps {
    open: boolean
    onClose: () => void
    usuario: UsuarioMinisterio | null
}

const perfilLabels: Record<UsuarioMinisterio['perfil'], string> = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    suporte: 'Suporte',
}

export default function UsuarioViewModal({ open, onClose, usuario }: UsuarioViewModalProps) {
    if (!open ||!usuario) return null

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div onClick={handleOverlayClick} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
            >
                {/* HEADER */}
                <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3B82F6]/20 border-[#3B82F6]/30 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-[#3B82F6]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Detalhes do Usuário</h2>
                            <p className="text-sm text-gray-400">Usuário Ministério</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{usuario.nome}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${
                                usuario.perfil === 'super_admin'? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                usuario.perfil === 'admin'? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                'bg-green-500/20 text-green-400 border-green-500/30'
                            }`}>
                                {perfilLabels[usuario.perfil]}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                            <span className="text-gray-300">{usuario.email}</span>
                        </div>
                        {usuario.departamento && (
                            <div className="flex items-center gap-3 text-sm">
                                <Building className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                                <span className="text-gray-300">{usuario.departamento}</span>
                            </div>
                        )}
                        {usuario.telefone && (
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                                <span className="text-gray-300">{usuario.telefone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <BadgeCheck className={`w-4 h-4 flex-shrink-0 ${usuario.ativo? 'text-green-400' : 'text-red-400'}`} />
                            <span className={`font-semibold ${usuario.ativo? 'text-green-400' : 'text-red-400'}`}>
                                {usuario.ativo? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                            <span className="text-gray-400">Criado em: {new Date(usuario.created_at).toLocaleDateString('pt-AO')}</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full h-11 font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}
