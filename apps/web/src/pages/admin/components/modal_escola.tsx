import { useState, useRef, useEffect, FormEvent, useMemo, MouseEvent } from 'react'
import { X, Upload, Loader2, Building2, Image as ImageIcon, MapPin, Phone, FileText, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL

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

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: FormData, id?: string) => Promise<void>
    escola: Escola | null
    saving: boolean
}

export default function EscolaModal({ open, onClose, onSave, escola, saving }: Props) {
    const fileRef = useRef<HTMLInputElement>(null)
    const primeiraCarga = useRef(true)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", nif: "", endereco: "", telefone: "", provincia: "", municipio: ""
    })

    const [dropdownProv, setDropdownProv] = useState(false)
    const [dropdownMun, setDropdownMun] = useState(false)
    const dropdownProvRef = useRef<HTMLDivElement>(null)
    const dropdownMunRef = useRef<HTMLDivElement>(null)

    const municipios = useMemo(() => MUNICIPIOS_ANGOLA[form.provincia] || [], [form.provincia]);

    

    useEffect(() => {
        if (form.nome) {
            const siglaAuto = form.nome.split(" ").filter(w => w.length > 2 &&!["da", "de", "do", "das", "dos", "e"].includes(w.toLowerCase())).map(w => w[0]).join("").toUpperCase().slice(0, 4);
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
                nome: escola.nome || "", sigla: escola.sigla || "", nif: escola.nif || "",
                endereco: escola.endereco || "", telefone: escola.telefone || "",
                provincia: escola.provincia || "", municipio: escola.municipio || ""
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    const inputClass = "w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
    const labelClass = "text-xs sm:text-right sm:justify-self-end text-gray-300 flex items-center gap-2"

    const CustomSelect = ({
        value, onSelect, options, placeholder, disabled = false, isOpen, setIsOpen, refDiv
    }: any) => (
        <div ref={refDiv} className="relative sm:col-span-3">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-[#1E293B]/95 backdrop-blur-2xl border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-48 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"> {/* SCROLL INVISIVEL */}
                        {options.length === 0 && <p className="px-4 py-3 text-gray-400 text-sm">Selecione uma província primeiro</p>}
                        {options.map((op: string) => (
                            <button
                                key={op}
                                type="button"
                                onClick={() => { onSelect(op); setIsOpen(false) }}
                                className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${
                                    value === op? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <span>{op}</span>
                                {value === op && <div className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6]"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div onClick={handleOverlayClick} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="w-full max-w-[680px] bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl" // overflow-hidden aqui
            >
                <div className="p-5 pb-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{escola? "Editar Escola" : "Cadastrar Escola"}</h2>
                            <p className="text-sm mt-1 text-gray-400">{escola? "Altere os dados abaixo" : "Preencha os dados da nova escola"}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="grid gap-5 py-4 px-5 overflow-y-auto flex-1 min-h-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"> {/* SCROLL INVISIVEL */}

                        {/* DADOS GERAIS */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}>Nome da Escola *</label>
                                <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="Escola Mutamba" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><FileText className="w-4 h-4" />Sigla</label>
                                <input value={form.sigla} readOnly className={`${inputClass} sm:col-span-3 bg-white/5 cursor-not-allowed`} placeholder="EM" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><FileText className="w-4 h-4" />NIF</label>
                                <input value={form.nif} onChange={e => handleChange('nif', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="5000000" />
                            </div>
                        </div>

                        {/* SEM TITULO "Contato e Endereço" */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Phone className="w-4 h-4" />Telefone</label>
                                <input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="+244 923 000 000" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-start gap-1 sm:gap-4">
                                <label className={`${labelClass} pt-2`}><MapPin className="w-4 h-4" />Endereço</label>
                                <input value={form.endereco} onChange={e => handleChange('endereco', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="Rua, Bairro" />
                            </div>
                        </div>

                        {/* SEM TITULO "Localização" */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}>Província *</label>
                                <CustomSelect
                                    refDiv={dropdownProvRef}
                                    value={form.provincia}
                                    onSelect={(val: string) => handleChange('provincia', val)}
                                    options={PROVINCIAS_ANGOLA}
                                    placeholder="Selecione a Província"
                                    isOpen={dropdownProv}
                                    setIsOpen={setDropdownProv}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}>Município</label>
                                <CustomSelect
                                    refDiv={dropdownMunRef}
                                    value={form.municipio}
                                    onSelect={(val: string) => handleChange('municipio', val)}
                                    options={municipios}
                                    placeholder="Selecione o Município"
                                    disabled={!form.provincia}
                                    isOpen={dropdownMun}
                                    setIsOpen={setDropdownMun}
                                />
                            </div>
                        </div>

                        {/* SEM TITULO "Logo" */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><ImageIcon className="w-4 h-4" />Logo</label>
                                <div className="sm:col-span-3 flex items-center gap-4">
                                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">{logoPreview? <img src={logoPreview} className="w-full h-full object-cover rounded-xl" /> : <Upload className="w-6 h-6 text-gray-500" />}</div>
                                    <div className="flex-1"><input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" onChange={handleFileChange} /><label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 text-sm font-semibold transition"><Upload className="w-4 h-4" /> Enviar Logo</label></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 shrink-0 bg-[#0F172A]/90">
                        <button type="button" onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 text-red-400 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="w-full h-11 font-bold rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#3B82F6]/20 transition">
                            {saving? <Loader2 className="w-4 h-4 animate-spin" /> : null}{saving? "Salvando..." : escola? "Salvar Alterações" : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
