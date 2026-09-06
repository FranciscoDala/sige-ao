import { useState, useEffect, ReactNode, ChangeEvent } from 'react'
import {
    Save, Upload, Palette, MapPin, Settings, Building2,
    Mail, Phone, Info, Loader2, Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../../services/auth'

type Tab = 'identificacao' | 'contato' | 'visual' | 'modulos' | 'avancado'

type Option = { value: string; label: string }

type EscolaForm = {
    nome: string; sigla: string; id_curto: string; nif: string; nivel_ensino: string;
    email: string; telefone: string; endereco: string; provincia: string; municipio: string;
    logo_url: string; banner_url: string; favicon_url: string;
    cor_primaria: string; cor_secundaria: string; cor_fundo: string;
    tema: string; fonte_titulo: string; fonte_corpo: string; estilo_card: string;
    permitir_auto_cadastro: boolean; usar_modulo_propina: boolean; usar_modulo_biblioteca: boolean; ativo: boolean;
}

const API_URL = import.meta.env.VITE_API_URL

const TEMA_OPTIONS: Option[] = [
    { value: 'claro', label: 'Claro' },
    { value: 'escuro', label: 'Escuro' },
]
const FONTE_OPTIONS: Option[] = [
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Open Sans', label: 'Open Sans' },
]
const ESTILO_CARD_OPTIONS: Option[] = [
    { value: 'arredondado', label: 'Arredondado' },
    { value: 'quadrado', label: 'Quadrado' },
    { value: 'minimalista', label: 'Minimalista' },
]

export default function DefinicoesEscolaPage() {
    const [activeTab, setActiveTab] = useState<Tab>('identificacao')
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const [form, setForm] = useState<EscolaForm>({
        nome: '', sigla: '', id_curto: '', nif: '', nivel_ensino: 'PRIMARIO',
        email: '', telefone: '', endereco: '', provincia: '', municipio: '',
        logo_url: '', banner_url: '', favicon_url: '',
        cor_primaria: '#0056b3', cor_secundaria: '#FFC107', cor_fundo: '#FFFFFF',
        tema: 'claro', fonte_titulo: 'Poppins', fonte_corpo: 'Inter', estilo_card: 'arredondado',
        permitir_auto_cadastro: false, usar_modulo_propina: true, usar_modulo_biblioteca: false, ativo: true,
    })

    const getAuthHeader = (isJson = true) => ({
        'Authorization': `Bearer ${authService.getToken()}`,
       ...(isJson? { 'Content-Type': 'application/json' } : {})
    })

    // 1. PEGAR DADOS DA ESCOLA AO CARREGAR
    useEffect(() => {
        const fetchEscola = async () => {
            try {
                const res = await fetch(`${API_URL}/escolas/me`, {
                    headers: getAuthHeader()
                })
                if (!res.ok) throw new Error('Erro ao carregar dados')
                const data = await res.json()

                const escolaData: EscolaForm = {
                   ...form,
                   ...data,
                    nome: data.nome || '',
                    sigla: data.sigla || '',
                    id_curto: data.id_curto || '',
                    nif: data.nif || '',
                    nivel_ensino: data.nivel_ensino || 'PRIMARIO',
                    email: data.email || '',
                    telefone: data.telefone || '',
                    endereco: data.endereco || '',
                    provincia: data.provincia || '',
                    municipio: data.municipio || '',
                    logo_url: data.logo_url || '',
                    banner_url: data.banner_url || '',
                    favicon_url: data.favicon_url || '',
                }

                setForm(escolaData)
                setLogoPreview(escolaData.logo_url)

                const userAtual = authService.getUser()
                if (userAtual && escolaData.nome) {
                    localStorage.setItem('user', JSON.stringify({...userAtual, escola_nome: escolaData.nome }))
                    window.dispatchEvent(new Event('user-updated'))
                }

            } catch (error: any) {
                toast.error(error.message || 'Erro ao carregar dados da escola')
            } finally {
                setLoadingData(false)
            }
        }
        fetchEscola()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChange = <K extends keyof EscolaForm>(key: K, value: EscolaForm[K]) => {
        setForm(prev => ({...prev, [key]: value }))
    }

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    // 2. SALVAR TUDO: DADOS + LOGO
    const handleSave = async () => {
        setLoading(true)
        try {
            // 👇 1. CRIA PAYLOAD E REMOVE CAMPOS VAZIOS
            const rawPayload = {
                nome: form.nome,
                sigla: form.sigla || undefined,
                nif: form.nif || undefined,
                email: form.email || undefined,
                telefone: form.telefone || undefined,
                endereco: form.endereco || undefined,
                provincia: form.provincia || undefined,
                municipio: form.municipio || undefined,
                cor_primaria: form.cor_primaria,
                cor_secundaria: form.cor_secundaria,
                cor_fundo: form.cor_fundo,
                tema: form.tema,
                fonte_titulo: form.fonte_titulo,
                fonte_corpo: form.fonte_corpo,
                estilo_card: form.estilo_card,
                permitir_auto_cadastro: form.permitir_auto_cadastro,
                usar_modulo_propina: form.usar_modulo_propina,
                usar_modulo_biblioteca: form.usar_modulo_biblioteca,
            }

            // Remove undefined e strings vazias
            const payload = Object.fromEntries(
                Object.entries(rawPayload).filter(([_, v]) => v!== undefined && v!== '')
            )

            // 1. SALVA OS DADOS JSON
            const res = await fetch(`${API_URL}/escolas/me/definicoes`, {
                method: 'PUT',
                headers: getAuthHeader(true),
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                // 👇 TRATA ERRO 422 DO FASTAPI
                if (Array.isArray(err.detail)) {
                    const msg = err.detail.map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', ')
                    throw new Error(msg)
                }
                throw new Error(err.detail || 'Erro ao salvar dados')
            }
            let updatedData = await res.json()

            // 2. SE TIVER LOGO NOVA, FAZ UPLOAD SEPARADO
            if (logoFile) {
                const formData = new FormData()
                formData.append('logo', logoFile)
                const logoRes = await fetch(`${API_URL}/escolas/me/logo`, {
                    method: 'POST',
                    headers: getAuthHeader(false),
                    body: formData
                })
                if (!logoRes.ok) {
                    const err = await logoRes.json()
                    throw new Error(err.detail || 'Erro ao salvar logo')
                }
                updatedData = await logoRes.json()
                setLogoFile(null)
            }

            const escolaData: EscolaForm = {
               ...form,
               ...updatedData,
                nome: updatedData.nome || '',
                sigla: updatedData.sigla || '',
                logo_url: updatedData.logo_url || '',
            }

            setForm(escolaData)
            setLogoPreview(escolaData.logo_url)

            const userAtual = authService.getUser()
            if (userAtual && escolaData.nome) {
                localStorage.setItem('user', JSON.stringify({...userAtual, escola_nome: escolaData.nome }))
                window.dispatchEvent(new Event('user-updated'))
            }

            toast.success('Definições salvas com sucesso!')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar definições') // 👈 Agora mostra o erro real
        } finally {
            setLoading(false)
        }
    }

    const tabs: { id: Tab, label: string, icon: any }[] = [
        { id: 'identificacao', label: 'Identificação', icon: Building2 },
        { id: 'contato', label: 'Contato', icon: MapPin },
        { id: 'visual', label: 'Visual', icon: Palette },
        { id: 'modulos', label: 'Módulos', icon: Settings },
        { id: 'avancado', label: 'Avançado', icon: Info },
    ]

    if (loadingData) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" /></div>

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">Definições da Escola</h1>
                    <p className="text-gray-400 text-sm">Personalize as informações e aparência do painel</p>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition">
                    {loading? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {loading? 'Salvando...' : 'Salvar Todas as Definições'}
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition flex-shrink-0 ${isActive? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                <Icon className="w-4 h-4" />{tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 lg:p-6">
                {/* IDENTIFICACAO */}
                {activeTab === 'identificacao' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Building2 className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Identificação</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome Completo" value={form.nome} onChange={v => handleChange('nome', v)} />
                            <Input label="Sigla" value={form.sigla} onChange={v => handleChange('sigla', v)} />
                            <Input label="ID Curto" value={form.id_curto} onChange={v => handleChange('id_curto', v)} disabled />
                            <Input label="NIF" value={form.nif} onChange={v => handleChange('nif', v)} />
                            <div>
                                <label className="text-sm text-white/80 mb-2 block">Nível de Ensino</label>
                                <input value={form.nivel_ensino} disabled className="w-full px-4 py-3 bg-white/5 border-white/10 rounded-xl text-white/50 cursor-not-allowed" />
                                <p className="text-xs text-gray-500 mt-1">Apenas o Ministério pode alterar</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTATO */}
                {activeTab === 'contato' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><MapPin className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Contato</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Email" type="email" icon={<Mail className="w-4 h-4" />} value={form.email} onChange={v => handleChange('email', v)} />
                            <Input label="Telefone" icon={<Phone className="w-4 h-4" />} value={form.telefone} onChange={v => handleChange('telefone', v)} />
                            <div className="md:col-span-2"><Input label="Endereço" value={form.endereco} onChange={v => handleChange('endereco', v)} /></div>
                            <Input label="Província" value={form.provincia} onChange={v => handleChange('provincia', v)} />
                            <Input label="Município" value={form.municipio} onChange={v => handleChange('municipio', v)} />
                        </div>
                    </div>
                )}

                {/* VISUAL */}
                {activeTab === 'visual' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4"><Palette className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Aparência</h2></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <UploadBox label="Logo da Escola" currentUrl={logoPreview || undefined} onFileSelect={handleLogoChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ColorPicker label="Cor Primária" value={form.cor_primaria} onChange={v => handleChange('cor_primaria', v)} />
                            <ColorPicker label="Cor Secundária" value={form.cor_secundaria} onChange={v => handleChange('cor_secundaria', v)} />
                            <ColorPicker label="Cor de Fundo" value={form.cor_fundo} onChange={v => handleChange('cor_fundo', v)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select label="Tema" value={form.tema} onChange={v => handleChange('tema', v)} options={TEMA_OPTIONS} />
                            <Select label="Fonte Título" value={form.fonte_titulo} onChange={v => handleChange('fonte_titulo', v)} options={FONTE_OPTIONS} />
                            <Select label="Fonte Corpo" value={form.fonte_corpo} onChange={v => handleChange('fonte_corpo', v)} options={FONTE_OPTIONS} />
                            <Select label="Estilo dos Cards" value={form.estilo_card} onChange={v => handleChange('estilo_card', v)} options={ESTILO_CARD_OPTIONS} />
                        </div>
                    </div>
                )}

                {/* MODULOS */}
                {activeTab === 'modulos' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Settings className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Módulos Ativos</h2></div>
                        <Toggle label="Módulo de Propinas" description="Ativa o controle financeiro e emissão de faturas" checked={form.usar_modulo_propina} onChange={v => handleChange('usar_modulo_propina', v)} />
                        <Toggle label="Módulo Biblioteca" description="Controle de livros e empréstimos" checked={form.usar_modulo_biblioteca} onChange={v => handleChange('usar_modulo_biblioteca', v)} />
                        <Toggle label="Auto Cadastro" description="Permitir que novos usuários se cadastrem" checked={form.permitir_auto_cadastro} onChange={v => handleChange('permitir_auto_cadastro', v)} />
                    </div>
                )}
            </div>
        </div>
    )
}

// ===== COMPONENTES PADRONIZADOS =====
interface InputProps { label: string; value: string; onChange: (value: string) => void; type?: string; icon?: ReactNode; disabled?: boolean; }
const Input = ({ label, value, onChange, type = 'text', icon, disabled }: InputProps) => (
    <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-3.5 text-gray-400">{icon}</div>}
            <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon? 'pl-12' : 'px-4'} py-3 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition disabled:text-white/50 disabled:cursor-not-allowed`} />
        </div>
    </div>
)

interface SelectProps { label: string; value: string; onChange: (value: string) => void; options: Option[]; }
const Select = ({ label, value, onChange, options }: SelectProps) => (
    <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition appearance-none">
            {options.map((opt) => <option key={opt.value} value={opt.value} className="bg-[#1E293B] text-white">{opt.label}</option>)}
        </select>
    </div>
)

interface ColorPickerProps { label: string; value: string; onChange: (value: string) => void; }
const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
    <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">{label}</label>
        <div className="flex items-center gap-3">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-14 h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer p-1" />
            <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-4 py-3 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition uppercase" />
        </div>
    </div>
)

interface ToggleProps { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void; }
const Toggle = ({ label, description, checked, onChange }: ToggleProps) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border-white/10 rounded-xl">
        <div>
            <p className="text-white font-medium">{label}</p>
            {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full transition ${checked? 'bg-[#3B82F6]' : 'bg-white/20'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked? 'translate-x-6' : 'translate-x-1'}`}></div>
        </button>
    </div>
)

interface UploadBoxProps { label: string; currentUrl?: string; onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void; }
const UploadBox = ({ label, currentUrl, onFileSelect }: UploadBoxProps) => (
    <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">{label}</label>
        <div className="flex items-center gap-4">
            {currentUrl? <img src={currentUrl} alt={label} className="w-24 h-24 object-contain rounded-lg bg-white/5 p-2 border-white/10" /> : <div className="w-24 h-24 rounded-lg bg-white/5 border-dashed border-white/20 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-500" /></div>}
            <input type="file" accept="image/*" onChange={onFileSelect} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3B82F6]/20 file:text-[#3B82F6] hover:file:bg-[#3B82F6]/30 file:font-semibold file:cursor-pointer cursor-pointer" />
        </div>
    </div>
)
