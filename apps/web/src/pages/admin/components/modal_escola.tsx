import { useState, useRef, useEffect, FormEvent, useMemo } from 'react'
import { X, Upload, Loader2, School, Building2, Image as ImageIcon, MapPin, Phone, FileText, Home } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL

// Dados de Angola
const PROVINCIAS_ANGOLA = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte",
  "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
];

const MUNICIPIOS_ANGOLA: Record<string, string[]> = {
  "Luanda": ["Luanda", "Belas", "Cazenga", "Cacuaco", "Viana", "Talatona", "Kilamba Kiaxi", "Icolo e Bengo", "Quiçama"],
  "Bengo": ["Caxito", "Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
  "Benguela": ["Benguela", "Baía Farta", "Balombo", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito"],
  "Lunda Sul": ["Saurimo", "Dala", "Cacolo", "Cassai Sul", "Muangueji", "Cassengo", "Luma Cassai", "Muconda"],
  "Huambo": ["Huambo", "Bailundo", "Caála", "Ecunha", "Londuimbali", "Mungo", "Cachiungo"],
  "Huíla": ["Lubango", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Matala"],
};

export interface Escola {
    id: string
    nome: string
    sigla?: string | null
    nif?: string | null
    endereco?: string | null
    telefone?: string | null
    provincia?: string | null
    municipio?: string | null
    logo_url?: string | null
    ativo: boolean
    cor_primaria: string
    cor_secundaria: string
    tema: string
}

export default function EscolaModal({ open, onClose, onSave, escola, saving }: { open: boolean, onClose: () => void, onSave: (data: FormData, id?: string) => Promise<void>, escola: Escola | null, saving: boolean }) {
    const fileRef = useRef<HTMLInputElement>(null)
    const primeiraCarga = useRef(true)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", nif: "", endereco: "", telefone: "", provincia: "", municipio: ""
    })

    const municipios = useMemo(() => MUNICIPIOS_ANGOLA[form.provincia] || [], [form.provincia]);

    useEffect(() => {
        if (form.nome) {
            const siglaAuto = form.nome
             .split(" ")
             .filter(w => w.length > 2 &&!["da", "de", "do", "das", "dos", "e"].includes(w.toLowerCase()))
             .map(w => w[0]).join("").toUpperCase().slice(0, 4);
            setForm(prev => ({...prev, sigla: siglaAuto }));
        } else {
            setForm(prev => ({...prev, sigla: "" }));
        }
    }, [form.nome]);

    useEffect(() => {
        if (primeiraCarga.current) return;
        setForm(prev => ({...prev, municipio: "" }));
    }, [form.provincia]);

    useEffect(() => {
        if (escola) {
            setForm({
                nome: escola.nome || "",
                sigla: escola.sigla || "",
                nif: escola.nif || "",
                endereco: escola.endereco || "",
                telefone: escola.telefone || "",
                provincia: escola.provincia || "",
                municipio: escola.municipio || ""
            })
            setLogoPreview(escola.logo_url || null)
            primeiraCarga.current = true;
        } else {
            setForm({ nome: "", sigla: "", nif: "", endereco: "", telefone: "", provincia: "", municipio: "" })
            setLogoPreview(null)
            primeiraCarga.current = true;
        }
    }, [escola, open])

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

    if (!open) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) { const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result as string); reader.readAsDataURL(file) }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome da escola é obrigatório"); return }
        if (!form.provincia) { toast.error("Selecione a província"); return }
        const formData = new FormData()
        if(!escola) formData.append("id", `ESC${Date.now().toString().slice(-3)}`)
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        formData.append("cor_primaria", "#3B82F6")
        formData.append("cor_secundaria", "#8B5CF6")
        formData.append("tema", "escuro")
        if (fileRef.current?.files?.[0]) formData.append("logo", fileRef.current.files[0])
        onSave(formData, escola?.id)
    }

    const handleChange = (field: string, value: string) => {
        if(field === 'provincia') primeiraCarga.current = false;
        setForm(prev => ({...prev, [field]: value }))
    }

    const inputClass = "w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] transition"
    const selectClass = inputClass + " appearance-none"
    const labelClass = "text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <style>{`
             .scroll-hidden::-webkit-scrollbar { display: none; }
             .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* overflow-hidden aqui pra cortar tudo que sair */}
            <div className="w-full max-w-3xl bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div><h2 className="text-xl font-bold text-white">{escola? "Editar Escola" : "Cadastrar Escola"}</h2><p className="text-sm text-gray-400">{escola? "Altere os dados abaixo" : "Preencha os dados da nova escola"}</p></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto scroll-hidden">
                        <section>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#3B82F6]" />Dados Gerais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nome da Escola *</label>
                                    <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={inputClass} placeholder="Escola Mutamba" required />
                                </div>
                                <div>
                                    <label className={labelClass}><FileText className="w-4 h-4" />Sigla</label>
                                    <input value={form.sigla} readOnly className={inputClass + " bg-white/5 cursor-not-allowed"} placeholder="EM" />
                                </div>
                                 <div>
                                    <label className={labelClass}><FileText className="w-4 h-4" />NIF</label>
                                    <input value={form.nif} onChange={e => handleChange('nif', e.target.value)} className={inputClass} placeholder="5000000" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Home className="w-4 h-4 text-[#3B82F6]" />Contato e Endereço</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}><Phone className="w-4 h-4" />Telefone</label>
                                    <input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} className={inputClass} placeholder="+244 923 000 000" />
                                </div>
                                 <div className="md:col-span-2">
                                    <label className={labelClass}><MapPin className="w-4 h-4" />Endereço</label>
                                    <input value={form.endereco} onChange={e => handleChange('endereco', e.target.value)} className={inputClass} placeholder="Rua, Bairro" />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3B82F6]" />Localização</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Província *</label>
                                    <select value={form.provincia} onChange={e => handleChange('provincia', e.target.value)} className={selectClass} required>
                                        <option value="">Selecione a Província</option>
                                        {PROVINCIAS_ANGOLA.map(p => <option key={p} value={p} className="bg-[#0F172A]">{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Município</label>
                                    <select value={form.municipio} onChange={e => handleChange('municipio', e.target.value)} className={selectClass} disabled={!form.provincia}>
                                        <option value="">Selecione o Município</option>
                                        {municipios.map(m => <option key={m} value={m} className="bg-[#0F172A]">{m}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#3B82F6]" />Logo</h3>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="w-20 h-20 bg-white/5 border-white/10 rounded-xl flex items-center justify-center shrink-0">{logoPreview? <img src={logoPreview} className="w-full h-full object-cover rounded-xl" /> : <Upload className="w-6 h-6 text-gray-500" />}</div>
                                <div className="flex-1 w-full"><input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" onChange={handleFileChange} /><label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 text-sm font-semibold"><Upload className="w-4 h-4" /> Enviar Logo</label></div>
                            </div>
                        </section>
                    </div>

                    <div className="p-6 border-t border-white/10 flex gap-3 shrink-0 bg-[#0F172A]/90">
                        {/* Botão Cancelar Vermelho */}
                        <button type="button" onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 text-red-400 transition">
                            Cancelar
                        </button>
                        {/* Botão Salvar Primary */}
                        <button type="submit" disabled={saving} className="w-full h-11 font-bold rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#3B82F6]/20 transition">
                            {saving? <Loader2 className="w-5 h-5 animate-spin" /> : null}{saving? "Salvando..." : escola? "Salvar" : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
