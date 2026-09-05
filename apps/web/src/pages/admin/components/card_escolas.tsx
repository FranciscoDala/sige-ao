import { Eye, Edit, Trash2, School, Phone, MapPinIcon, Hash } from 'lucide-react'
import { Escola } from './modal_escola'

interface EscolaCardProps {
    escola: Escola
    onView: () => void // 👈 1. ADICIONADO
    onEdit: () => void
    onDelete: () => void
}

export default function EscolaCard({ escola, onView, onEdit, onDelete }: EscolaCardProps) { // 👈 1. RECEBENDO ONVIEW
    return (
        <div className="group bg-white/5 backdrop-blur-2xl border-white/10 rounded-2xl p-5 hover:border-[#3B82F6]/60 hover:bg-white/10 transition-all duration-300 w-full snap-center shrink-0 shadow-lg">
            <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/20 mt-1 overflow-hidden">
                    {escola.logo_url ?
                        <img src={escola.logo_url} alt={escola.nome} className="w-full h-full object-cover rounded-2xl" />
                        : <School className="w-8 h-8 text-white" />
                    }
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg leading-tight break-words">{escola.nome}</h3>
                            <p className="text-sm text-[#3B82F6] font-semibold">{escola.sigla || `ID: ${escola.id}`}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border flex-shrink-0 ${escola.ativo ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            {escola.ativo ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>

                    <div className="space-y-1.5 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPinIcon className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                            <span className="break-words">{escola.provincia || 'N/A'} - {escola.municipio || 'N/A'}</span>
                        </div>
                        {escola.telefone && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Phone className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                                <span>{escola.telefone}</span>
                            </div>
                        )}
                        {escola.nif && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Hash className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                                <span>NIF: {escola.nif}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                {/* BOTAO VER OCULTO */}
                {/*
                <button onClick={onView} className="flex items-center justify-center gap-2 p-2.5 bg-[#3B82F6]/15 hover:bg-[#3B82F6]/30 border border-[#3B82F6]/20 rounded-lg text-sm text-[#3B82F6] font-semibold transition">
                    <Eye className="w-4 h-4" /> Ver
                </button>
                */}
                <button onClick={onEdit} className="flex items-center justify-center gap-2 p-2.5 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 rounded-lg text-sm text-[#8B5CF6] font-semibold transition">
                    <Edit className="w-4 h-4" /> Editar
                </button>
                <button onClick={onDelete} className="flex items-center justify-center gap-2 p-2.5 bg-red-500/15 hover:bg-red-500/30 border-red-500/20 rounded-lg text-sm text-red-400 font-semibold transition">
                    <Trash2 className="w-4 h-4" /> Apagar
                </button>
            </div>
        </div>
    )
}
