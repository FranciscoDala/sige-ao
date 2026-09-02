import { useState, useRef, useEffect, FormEvent } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'

interface Escola {
    id: number
    nome: string
    sigla: string | null
    provincia: string | null
    municipio: string | null
    cor_primaria: string
    cor_secundaria: string
    tema: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: FormData) => Promise<void>
    escola: Escola | null
    saving: boolean
}

const focusStyle = { outline: 'none', boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.3)' } // dourado

export default function EscolaModal({ open, onClose, onSave, escola, saving }: Props) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", provincia: "", municipio: "",
        cor_primaria: "#CF0921", cor_secundaria: "#FFD700", tema: "claro"
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
        } else {
            setForm({ nome: "", sigla: "", provincia: "", municipio: "", cor_primaria: "#CF0921", cor_secundaria: "#FFD700", tema: "claro" })
        }
    }, [escola, open])

    if (!open) return null

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
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

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="w-[95vw] max-w-[600px] p-0 flex flex-col border shadow-2xl overflow-hidden mx-auto"
                style={{
                    backgroundColor: '#1A1A1A',
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '1rem',
                    height: '85vh',
                    maxHeight: '85vh'
                }}
                onClick={(e) => e.stopPropagation()} // não fecha ao clicar dentro
            >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* HEADER FIXO */}
                    <div className="p-5 pb-3 shrink-0 text-left border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <h2 className="text-lg font-bold" style={{ color: '#fff' }}>{escola ? "Editar Escola" : "Cadastrar Nova Escola"}</h2>
                        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{escola ? "Altere os dados abaixo." : "Preencha os dados da escola"}</p>
                    </div>

                    {/* BODY COM SCROLL */}
                    <div className="grid gap-4 py-4 px-5 overflow-y-auto flex-1 min-h-0">
                        <p className="text-sm font-semibold -mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Dados da Escola</p>

                        {/* Nome */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label htmlFor="nome" className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Nome *</label>
                            <input
                                id="nome"
                                value={form.nome}
                                onChange={e => handleChange('nome', e.target.value)}
                                className="sm:col-span-3 text-xs h-9 px-3 rounded-md"
                                style={{ backgroundColor: '#000', color: '#fff', border: '1.5px solid #CF0921', borderRadius: '0.5rem', ...focusStyle }}
                                placeholder="EEM Joaquim Capango"
                                required
                            />
                        </div>

                        {/* Sigla + Provincia */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label htmlFor="sigla" className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Sigla</label>
                            <input
                                id="sigla"
                                value={form.sigla}
                                onChange={e => handleChange('sigla', e.target.value)}
                                className="sm:col-span-3 text-xs h-9 px-3 rounded-md"
                                style={{ backgroundColor: '#000', color: '#fff', border: '1.5px solid #CF0921', borderRadius: '0.5rem', ...focusStyle }}
                                placeholder="EEMJC"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label htmlFor="provincia" className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Província</label>
                            <input
                                id="provincia"
                                value={form.provincia}
                                onChange={e => handleChange('provincia', e.target.value)}
                                className="sm:col-span-3 text-xs h-9 px-3 rounded-md"
                                style={{ backgroundColor: '#000', color: '#fff', border: '1.5px solid #CF0921', borderRadius: '0.5rem', ...focusStyle }}
                                placeholder="Luanda"
                            />
                        </div>

                        {/* Municipio */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label htmlFor="municipio" className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Município</label>
                            <input
                                id="municipio"
                                value={form.municipio}
                                onChange={e => handleChange('municipio', e.target.value)}
                                className="sm:col-span-3 text-xs h-9 px-3 rounded-md"
                                style={{ backgroundColor: '#000', color: '#fff', border: '1.5px solid #CF0921', borderRadius: '0.5rem', ...focusStyle }}
                                placeholder="Talatona"
                            />
                        </div>

                        {/* Cores */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Cor Primária</label>
                            <input
                                type="color"
                                value={form.cor_primaria}
                                onChange={e => handleChange('cor_primaria', e.target.value)}
                                className="sm:col-span-3 w-full h-9 rounded-md border"
                                style={{ backgroundColor: '#000', border: '1.5px solid #CF0921' }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Cor Secundária</label>
                            <input
                                type="color"
                                value={form.cor_secundaria}
                                onChange={e => handleChange('cor_secundaria', e.target.value)}
                                className="sm:col-span-3 w-full h-9 rounded-md border"
                                style={{ backgroundColor: '#000', border: '1.5px solid #CF0921' }}
                            />
                        </div>

                        {/* Tema */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label htmlFor="tema" className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Tema</label>
                            <select
                                id="tema"
                                value={form.tema}
                                onChange={e => handleChange('tema', e.target.value)}
                                className="sm:col-span-3 flex h-9 w-full rounded-md px-3 py-2 text-xs"
                                style={{ backgroundColor: '#000', color: '#fff', border: '1.5px solid #CF0921', borderRadius: '0.5rem', ...focusStyle }}
                            >
                                <option value="claro">Claro</option>
                                <option value="escuro">Escuro</option>
                            </select>
                        </div>

                        {/* Logo */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                            <label className="text-xs sm:text-right sm:justify-self-end" style={{ color: 'rgba(255,255,255,0.7)' }}>Logo</label>
                            <div className="sm:col-span-3">
                                <input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" />
                                <label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border-dashed border-white/30 rounded-lg text-white/70 cursor-pointer hover:bg-white/20 text-xs h-9">
                                    <Upload className="w-4 h-4" /> Enviar Logo
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* FOOTER FIXO */}
                    <div className="p-4 border-t shrink-0 flex-col sm:flex-row gap-2 flex" style={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            className="gap-2 text-sm w-full sm:flex-1 h-10 font-bold rounded-md flex items-center justify-center"
                            style={{ background: 'linear-gradient(90deg, #CF0921 0%, #FFD700 100%)', color: '#000', borderRadius: '0.5rem' }}
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {escola ? "Salvar Alterações" : "Cadastrar Escola"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm w-full sm:flex-1 h-10 font-semibold rounded-md"
                            style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
