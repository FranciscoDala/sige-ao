import { Eye, Edit, Trash2, School, Phone, MapPinIcon } from 'lucide-react'
import { Escola } from './modal_escola'

interface EscolaCardProps {
    escola: Escola
    onEdit: () => void
    onDelete: () => void
}

export default function EscolaCard({ escola, onEdit, onDelete }: EscolaCardProps) {
    return (
        <div className="group bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-5 hover:border-[#3B82F6]/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 w-full snap-center shrink-0">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center flex-shrink-0">
                        {escola.logo_url? <img src={escola.logo_url} alt={escola.nome} className="w-full h-full object-cover rounded-xl" /> : <School className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{escola.nome}</h3>
                        <p className="text-xs text-gray-400">{escola.sigla || `ID: ${escola.id}`}</p>
                    </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${escola.ativo? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {escola.ativo? 'Ativa' : 'Inativa'}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPinIcon className="w-4 h-4 text-[#3B82F6]" />
                    <span>{escola.provincia || 'N/A'} - {escola.municipio || 'N/A'}</span>
                </div>
                {escola.telefone && <div className="flex items-center gap-2 text-sm text-gray-300"><Phone className="w-4 h-4 text-[#3B82F6]" /><span>{escola.telefone}</span></div>}
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/10">
                <button className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-[#3B82F6]/20 rounded-lg text-sm transition"><Eye className="w-4 h-4" /> Ver</button>
                <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-[#8B5CF6]/20 rounded-lg text-sm transition"><Edit className="w-4 h-4" /> Editar</button>
                <button onClick={onDelete} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
        </div>
    )
}
