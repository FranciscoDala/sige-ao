import { useState, useRef, useEffect, FormEvent } from 'react'
import { X, Upload, Loader2, School, Building2, Palette, Image as ImageIcon, MapPin } from 'lucide-react' // <- ADICIONEI O MapPin AQUI
import { toast } from 'sonner'

interface Escola {
    id: string
    nome: string
    sigla: string | null
    provincia: string | null
    municipio: string | null
    cor_primaria: string
    cor_secundaria: string
    tema: string
    logo_url?: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: FormData) => Promise<void>
    escola: Escola | null
    saving: boolean
}

export default function EscolaModal({ open, onClose, onSave, escola, saving }: Props) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", provincia: "", municipio: "",
        cor_primaria: "#3B82F6", cor_secundaria: "#8B5CF6", tema: "escuro"
    })

    useEffect(() => {
        if (escola) {
            setForm({
                nome: escola.nome,
                sigla: escola.sigla || "",
                provincia: escola.provincia || "",
                municipio: escola.municipio || "",
                cor_primaria: escola.cor_primaria,
                cor_secundaria: escola.cor_secundaria,
                tema: escola.tema
            })
            setLogoPreview(escola.logo_url || null)
        } else {
            setForm({ nome: "", sigla: "", provincia: "", municipio: "", cor_primaria: "#3B82F6", cor_secundaria: "#8B5CF6", tema: "escuro" })
            setLogoPreview(null)
        }
    }, [escola, open])

    useEffect(() => {
        if (!open) return
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    if (!open) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setLogoPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome da escola é obrigatório"); return }
        const formData = new FormData()
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        if (fileRef.current?.files?.[0]) {
            formData.append("logo", fileRef.current.files[0])
        }
        onSave(formData)
    }

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const inputClass = "w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] transition"
    const labelClass = "text-sm font-semibold text-gray-300 mb-2 block"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in-0">
            <div className="w-full max-w-2xl bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center">
                            <School className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{escola ? "Editar Escola" : "Cadastrar Nova Escola"}</h2>
                            <p className="text-sm text-gray-400">{escola ? "Altere os dados abaixo." : "Preencha os dados da nova escola"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* DADOS GERAIS */}
                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#3B82F6]" />Dados Gerais</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nome" className={labelClass}>Nome da Escola *</label>
                                <input id="nome" value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={inputClass} placeholder="Escola Mutamba" required />
                            </div>
                            <div>
                                <label htmlFor="sigla" className={labelClass}>Sigla</label>
                                <input id="sigla" value={form.sigla} onChange={e => handleChange('sigla', e.target.value)} className={inputClass} placeholder="EEM" />
                            </div>
                        </div>
                    </div>

                    {/* LOCALIZAÇÃO */}
                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#3B82F6]" />Localização</p> {/* <- AGORA VAI FUNCIONAR */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="provincia" className={labelClass}>Província</label>
                                <input id="provincia" value={form.provincia} onChange={e => handleChange('provincia', e.target.value)} className={inputClass} placeholder="Luanda" />
                            </div>
                            <div>
                                <label htmlFor="municipio" className={labelClass}>Município</label>
                                <input id="municipio" value={form.municipio} onChange={e => handleChange('municipio', e.target.value)} className={inputClass} placeholder="Talatona" />
                            </div>
                        </div>
                    </div>

                    {/* PERSONALIZAÇÃO */}
                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-[#3B82F6]" />Personalização</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Cor Primária</label>
                                <input type="color" value={form.cor_primaria} onChange={e => handleChange('cor_primaria', e.target.value)} className="w-full h-11 rounded-xl bg-white/5 border-white/10 cursor-pointer" />
                            </div>
                            <div>
                                <label className={labelClass}>Cor Secundária</label>
                                <input type="color" value={form.cor_secundaria} onChange={e => handleChange('cor_secundaria', e.target.value)} className="w-full h-11 rounded-xl bg-white/5 border border-white/10 cursor-pointer" />
                            </div>
                            <div>
                                <label htmlFor="tema" className={labelClass}>Tema</label>
                                <select id="tema" value={form.tema} onChange={e => handleChange('tema', e.target.value)} className={inputClass}>
                                    <option value="escuro">Escuro</option>
                                    <option value="claro">Claro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* LOGO */}
                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#3B82F6]" />Logo da Escola</p>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover rounded-xl" /> : <Upload className="w-6 h-6 text-gray-500" />}
                            </div>
                            <div className="flex-1">
                                <input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" onChange={handleFileChange} />
                                <label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 text-sm font-semibold">
                                    <Upload className="w-4 h-4" /> Enviar Logo
                                </label>
                            </div>
                        </div>
                    </div>

                </form>

                {/* FOOTER */}
                <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 h-11 font-semibold rounded-xl bg-white/5 text-white hover:bg-white/10 transition">
                        Cancelar
                    </button>
                    <button type="submit" onClick={handleSubmit} disabled={saving} className="w-full sm:flex-1 h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#3B82F6]/30 transition disabled:opacity-50">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {saving ? "Salvando..." : escola ? "Salvar Alterações" : "Criar Escola"}
                    </button>
                </div>
            </div>
        </div>
    )
}
