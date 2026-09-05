import { User, Mail, ShieldCheck, Pencil, Trash2, Eye, Building } from 'lucide-react'
import { UsuarioMinisterio } from '../../types/usuario' // 👈 Import do types

interface UsuarioCardProps {
    usuario: UsuarioMinisterio
    onView: () => void
    onEdit: () => void // 👈 Vai estar desativado na page
    onDelete: () => void
}

const perfilColors: Record<UsuarioMinisterio['perfil'], string> = {
    super_admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    suporte: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const perfilLabels: Record<UsuarioMinisterio['perfil'], string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    suporte: 'Suporte',
}

export default function UsuarioCard({ usuario, onView, onEdit, onDelete }: UsuarioCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-5 hover:border-[#3B82F6]/30 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-black/10">
            {/* HEADER */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">{usuario.nome}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${perfilColors[usuario.perfil]}`}>
                            {perfilLabels[usuario.perfil]}
                        </span>
                    </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${usuario.ativo? 'bg-green-500' : 'bg-red-500'} shadow-lg ${usuario.ativo? 'shadow-green-500/50' : 'shadow-red-500/50'}`}></div>
            </div>

            {/* INFO */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                    <span className="truncate">{usuario.email}</span>
                </div>
                {usuario.departamento && ( // 👈 Troquei escola por departamento
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Building className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                        <span className="truncate">{usuario.departamento}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                    <span className="truncate">{usuario.ativo? 'Ativo' : 'Inativo'}</span>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
                <button onClick={onView} className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition">
                    <Eye className="w-4 h-4" /> Ver
                </button>
                <button
                    onClick={onEdit}
                    disabled // 👈 Desativado pq é só pra criar
                    className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-gray-500 transition cursor-not-allowed opacity-50"
                >
                    <Pencil className="w-4 h-4" /> Editar
                </button>
                <button onClick={onDelete} className="h-10 px-3 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
