import { School, Edit, Trash2, Palette } from 'lucide-react'

interface Escola {
    id: number
    nome: string
    sigla: string | null
    id_curto: string
    provincia: string | null
    municipio: string | null
    logo_url: string | null
    cor_primaria: string
    cor_secundaria: string
    tema: string
}

interface Props {
    escola: Escola
    isMinisterio: boolean
    onEdit: (escola: Escola) => void
    onDelete: (id: number) => void
}

export default function EscolaCard({ escola, isMinisterio, onEdit, onDelete }: Props) {
    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-[#FFD700]/50 transition" >
            <div className="flex items-center gap-3 mb-3" >
                {
                    escola.logo_url ?
                        <img src={escola.logo_url} className="w-12 h-12 rounded-xl object-cover border border-white/20" /> :
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center" >
                            <School className="w-6 h-6 text-white/50" />
                        </div>
                }
                <div>
                    <h3 className="font-bold text-white" > {escola.nome} </h3>
                    < p className="text-sm text-white/60" > {escola.id_curto} • {escola.sigla} </p>
                </div>
            </div>
            < p className="text-sm text-white/70 mb-3" > {escola.municipio}, {escola.provincia} </p>

            < div className="flex gap-2 mb-4" >
                <div title="Cor Primária" className="w-6 h-6 rounded border border-white/20" style={{ background: escola.cor_primaria }} />
                < div title="Cor Secundária" className="w-6 h-6 rounded border-white/20" style={{ background: escola.cor_secundaria }} />
                < span className="text-xs text-white/50 flex items-center gap-1" > <Palette className="w-3 h-3" /> {escola.tema} </span>
            </div>

            {
                isMinisterio && (
                    <div className="flex gap-2" >
                        <button onClick={() => onEdit(escola)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm" >
                            <Edit className="w-4 h-4" /> Editar
                        </button>
                        < button onClick={() => onDelete(escola.id)
                        } className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm" >
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                )}
        </div>
    )
}
