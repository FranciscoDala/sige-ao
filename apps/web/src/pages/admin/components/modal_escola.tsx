import { useState, useRef, useEffect, FormEvent, useMemo } from 'react'
import { X, Upload, Loader2, School, Building2, Image as ImageIcon, MapPin, Phone, Mail, FileText, Home } from 'lucide-react'
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
  // Adiciona o resto se quiser. Por agora deixei só 3 pra ficar leve
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
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", nif: "", endereco: "", telefone: "", provincia: "", municipio: ""
    })

    const municipios = useMemo(() => MUNICIPIOS_ANGOLA[form.provincia] || [], [form.provincia]);

    // Gera sigla automatica: "Escola Mutamba" -> "EM"
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

    // Zera municipio quando troca provincia
    useEffect(() => {
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
        } else {
            setForm({ nome: "", sigla: "", nif: "", endereco: "", telefone: "", provincia: "", municipio: "" })
            setLogoPreview(null)
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

    const handleChange = (field: string, value: string) => setForm(prev => ({...prev, [field]: value }))

    const inputClass = "w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] transition"
    const selectClass = inputClass + " appearance-none"
    const labelClass = "text-sm font-semibold text-gray-300 flex items-center gap-2"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            {/* Adiciona scrollbar invisivel */}
            <style>{`
               .scroll-hidden::-webkit-scrollbar { display: none; }
               .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="w-full max-w-3xl bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center"><School className="w-5 h-5 text-white" /></div>
                        <div><h2 className="text-xl font-bold text-white">{escola? "Editar Escola" : "Cadastrar Escola"}</h2><p className="text-sm text-gray-400">{escola? "Altere os dados abaixo" : "Preencha os dados da nova escola"}</p></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto scroll-hidden">
                    <section>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#3B82F6]" />Dados Gerais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Nome da Escola *</label>
                                <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={inputClass} placeholder="Escola Mutamba" required />
                            </div>
                            <div>
                                <label className={labelClass}><FileText className="w-4 h-4" />Sigla</label>
                                <input value={form.sigla} onChange={e => handleChange('sigla', e.target.value)} className={inputClass + " bg-white/5"} placeholder="EM" readOnly />
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
                            <div className="flex-1 w-full"><input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" onChange={handleFileChange} /><label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 text-sm font-semibold"><Upload className="w-4 h-4" /> Enviar Logo</label></div>
                        </div>
                    </section>
                </form>

                <div className="p-6 border-t border-white/10 flex gap-3 shrink-0 bg-[#0F172A]/90">
                    <button type="button" onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-white/5 hover:bg-white/10 transition">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} disabled={saving} className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-[#3B82F6]/30 transition">
                        {saving? <Loader2 className="w-5 h-5 animate-spin" /> : null}{saving? "Salvando..." : escola? "Salvar Alterações" : "Criar Escola"}
                    </button>
                </div>
            </div>
        </div>
    )
}
