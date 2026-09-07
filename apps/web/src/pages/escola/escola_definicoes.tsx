import { useState, useEffect, ReactNode, ChangeEvent, useRef } from 'react'
import {
    Save, Upload, Palette, MapPin, Settings, Building2,
    Mail, Phone, Info, Loader2, Image as ImageIcon, ChevronDown, X
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
    { value: 'elevado', label: 'Elevado com Sombra' },
    { value: 'borda_colorida', label: 'Borda Colorida' },
    { value: 'glass', label: 'Glass Morphism' },
]

export default function DefinicoesEscolaPage() {
    const [activeTab, setActiveTab] = useState<Tab>('identificacao')
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [faviconFile, setFaviconFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

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

    const corPrimaria = form.cor_primaria
    const corSecundaria = form.cor_secundaria
    const isClaro = form.tema === 'claro'
    const textPrimary = isClaro? '#1E293B' : 'white'
    const textSecondary = isClaro? '#64748B' : '#9CA3AF'
    const bgCard = isClaro? 'bg-black/5' : 'bg-white/5'
    const borderCard = isClaro? 'border-black/10' : 'border-white/10'
    const hoverBg = isClaro? 'hover:bg-black/5' : 'hover:bg-white/10'

    useEffect(() => {
        const fetchEscola = async () => {
            try {
                const res = await fetch(`${API_URL}/escolas/me`, { headers: getAuthHeader() })
                if (!res.ok) throw new Error('Erro ao carregar dados')
                const data = await res.json()
                const escolaData: EscolaForm = {...form,...data }
                setForm(escolaData)
                setLogoPreview(escolaData.logo_url)
                setBannerPreview(escolaData.banner_url)
                setFaviconPreview(escolaData.favicon_url)
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

    const handleFileChange = (type: 'logo' | 'banner' | 'favicon') => (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const maxSize = type === 'favicon'? 1 * 1024 * 1024 : 5 * 1024 * 1024
            if (file.size > maxSize) {
                toast.error(`Arquivo muito grande. Máximo ${maxSize / 1024 / 1024}MB`)
                return
            }
            const url = URL.createObjectURL(file)
            if (type === 'logo') { setLogoFile(file); setLogoPreview(url) }
            if (type === 'banner') { setBannerFile(file); setBannerPreview(url) }
            if (type === 'favicon') { setFaviconFile(file); setFaviconPreview(url) }
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const token = authService.getToken()
            if (!token) throw new Error("Token não encontrado. Faça login novamente.")
            const clean = (s: string) => s?.replace(/´/g, "'").trim() || undefined
            const rawPayload = {
                nome: clean(form.nome), sigla: clean(form.sigla), nif: clean(form.nif), email: clean(form.email),
                telefone: clean(form.telefone), endereco: clean(form.endereco), provincia: clean(form.provincia), municipio: clean(form.municipio),
                cor_primaria: form.cor_primaria, cor_secundaria: form.cor_secundaria, cor_fundo: form.cor_fundo, tema: form.tema,
                fonte_titulo: form.fonte_titulo, fonte_corpo: form.fonte_corpo, estilo_card: form.estilo_card,
                permitir_auto_cadastro: form.permitir_auto_cadastro, usar_modulo_propina: form.usar_modulo_propina, usar_modulo_biblioteca: form.usar_modulo_biblioteca,
            }
            const payload = Object.fromEntries(Object.entries(rawPayload).filter(([_, v]) => v!== undefined && v!== null && v!== ''))
            const res = await fetch(`${API_URL}/escolas/me/definicoes`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) {
                const err = await res.json()
                if (Array.isArray(err.detail)) throw new Error(err.detail.map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(', '))
                throw new Error(err.detail || 'Erro ao salvar dados')
            }
            let updatedData = await res.json()

            const uploadFile = async (file: File, endpoint: string, fieldName: string) => {
                const formData = new FormData()
                formData.append(fieldName, file)
                const fileRes = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
                if (!fileRes.ok) throw new Error((await fileRes.json()).detail || `Erro ao salvar ${endpoint}`)
                return await fileRes.json()
            }
            if (logoFile) updatedData = await uploadFile(logoFile, '/escolas/me/logo', 'logo')
            if (bannerFile) updatedData = await uploadFile(bannerFile, '/escolas/me/banner', 'file')
            if (faviconFile) updatedData = await uploadFile(faviconFile, '/escolas/me/favicon', 'file')

            const escolaData: EscolaForm = {...form,...updatedData }
            setForm(escolaData)
            setLogoPreview(escolaData.logo_url)
            setBannerPreview(escolaData.banner_url)
            setFaviconPreview(escolaData.favicon_url)
            setLogoFile(null); setBannerFile(null); setFaviconFile(null)

            localStorage.setItem('escola_tema', JSON.stringify(updatedData))
            window.dispatchEvent(new Event('escola-tema-updated'))
            toast.success('Definições salvas com sucesso!')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar definições')
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

    if (loadingData) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" style={{ color: corPrimaria }} /></div>

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold" style={{ color: textPrimary }}>Definições da Escola</h1>
                    <p className="text-sm" style={{ color: textSecondary }}>Personalize as informações e aparência do painel</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full lg:w-auto h-11 px-5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition"
                    style={{
                        background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                        borderRadius: form.estilo_card === 'quadrado'? '0.5rem' : form.estilo_card === 'minimalista'? '0.25rem' : '0.75rem'
                    }}
                >
                    {loading? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-5 h-5 text-white" />} {loading? 'Salvando...' : 'Salvar Definições'}
                </button>
            </div>

            <div className={`${bgCard} backdrop-blur-xl ${borderCard} rounded-2xl p-2`}>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition flex-shrink-0`}
                                style={{
                                    backgroundColor: isActive? `${corPrimaria}33` : 'transparent',
                                    color: isActive? 'white' : textSecondary // 👈 CORRIGIDO: ativo agora é branco
                                }}
                            >
                                <Icon className="w-4 h-4" style={{ color: isActive? 'white' : textSecondary }} />{tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={`${bgCard} backdrop-blur-xl ${borderCard} rounded-2xl p-4 lg:p-6`}>
                {activeTab === 'identificacao' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Building2 className="w-5 h-5" style={{ color: corPrimaria }} /><h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Identificação</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome Completo" value={form.nome} onChange={v => handleChange('nome', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <Input label="Sigla" value={form.sigla} onChange={v => handleChange('sigla', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <Input label="ID Curto" value={form.id_curto} onChange={() => { }} disabled cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <Input label="NIF" value={form.nif} onChange={v => handleChange('nif', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <Input label="Nível de Ensino" value={form.nivel_ensino} onChange={() => { }} disabled cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                        </div>
                    </div>
                )}

                {activeTab === 'contato' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><MapPin className="w-5 h-5" style={{ color: corPrimaria }} /><h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Contato</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Email" type="email" icon={<Mail className="w-4 h-4" />} value={form.email} onChange={v => handleChange('email', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <Input label="Telefone" icon={<Phone className="w-4 h-4" />} value={form.telefone} onChange={v => handleChange('telefone', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <div className="md:col-span-2"><Input label="Endereço" value={form.endereco} onChange={v => handleChange('endereco', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} /></div>
                            <Input label="Província" value={form.provincia} onChange={v => handleChange('provincia', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <Input label="Município" value={form.municipio} onChange={v => handleChange('municipio', v)} cor={corPrimaria} textColor={textPrimary} bg={bgCard} border={borderCard} />
                        </div>
                    </div>
                )}

                {activeTab === 'visual' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4"><Palette className="w-5 h-5" style={{ color: corPrimaria }} /><h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Aparência</h2></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <UploadBox label="Logo da Escola" currentUrl={logoPreview || undefined} fileName={logoFile?.name} onFileSelect={handleFileChange('logo')} cor={corPrimaria} onRemove={() => { setLogoFile(null); setLogoPreview(form.logo_url) }} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <UploadBox label="Banner do Painel" currentUrl={bannerPreview || undefined} fileName={bannerFile?.name} onFileSelect={handleFileChange('banner')} cor={corPrimaria} onRemove={() => { setBannerFile(null); setBannerPreview(form.banner_url) }} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <UploadBox label="Favicon" currentUrl={faviconPreview || undefined} fileName={faviconFile?.name} onFileSelect={handleFileChange('favicon')} cor={corPrimaria} onRemove={() => { setFaviconFile(null); setFaviconPreview(form.favicon_url) }} textColor={textPrimary} bg={bgCard} border={borderCard} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ColorPicker label="Cor Primária" value={form.cor_primaria} onChange={v => handleChange('cor_primaria', v)} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <ColorPicker label="Cor Secundária" value={form.cor_secundaria} onChange={v => handleChange('cor_secundaria', v)} textColor={textPrimary} bg={bgCard} border={borderCard} />
                            <ColorPicker label="Cor de Fundo" value={form.cor_fundo} onChange={v => handleChange('cor_fundo', v)} textColor={textPrimary} bg={bgCard} border={borderCard} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CustomSelect label="Tema" value={form.tema} onChange={v => handleChange('tema', v)} options={TEMA_OPTIONS} cor={corPrimaria} textColor={textPrimary} isClaro={isClaro} bg={bgCard} border={borderCard} />
                            <CustomSelect label="Fonte Título" value={form.fonte_titulo} onChange={v => handleChange('fonte_titulo', v)} options={FONTE_OPTIONS} cor={corPrimaria} textColor={textPrimary} isClaro={isClaro} bg={bgCard} border={borderCard} />
                            <CustomSelect label="Fonte Corpo" value={form.fonte_corpo} onChange={v => handleChange('fonte_corpo', v)} options={FONTE_OPTIONS} cor={corPrimaria} textColor={textPrimary} isClaro={isClaro} bg={bgCard} border={borderCard} />
                            <CustomSelect label="Estilo dos Cards" value={form.estilo_card} onChange={v => handleChange('estilo_card', v)} options={ESTILO_CARD_OPTIONS} cor={corPrimaria} textColor={textPrimary} isClaro={isClaro} bg={bgCard} border={borderCard} />
                        </div>
                    </div>
                )}

                {activeTab === 'modulos' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Settings className="w-5 h-5" style={{ color: corPrimaria }} /><h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Módulos Ativos</h2></div>
                        <Toggle label="Módulo de Propinas" description="Ativa o controle financeiro e emissão de faturas" checked={form.usar_modulo_propina} onChange={v => handleChange('usar_modulo_propina', v)} cor={corPrimaria} textColor={textPrimary} textSecondary={textSecondary} bg={bgCard} border={borderCard} />
                        <Toggle label="Módulo Biblioteca" description="Controle de livros e empréstimos" checked={form.usar_modulo_biblioteca} onChange={v => handleChange('usar_modulo_biblioteca', v)} cor={corPrimaria} textColor={textPrimary} textSecondary={textSecondary} bg={bgCard} border={borderCard} />
                        <Toggle label="Auto Cadastro" description="Permitir que novos usuários se cadastrem" checked={form.permitir_auto_cadastro} onChange={v => handleChange('permitir_auto_cadastro', v)} cor={corPrimaria} textColor={textPrimary} textSecondary={textSecondary} bg={bgCard} border={borderCard} />
                    </div>
                )}

                {activeTab === 'avancado' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Info className="w-5 h-5" style={{ color: corPrimaria }} /><h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Avançado</h2></div>
                        <div className={`p-4 ${bgCard} ${borderCard} rounded-xl`}>
                            <p style={{ color: textSecondary }}>Área para configurações futuras: API Keys, Webhooks, Integrações.</p>
                        </div>
                        <Toggle label="Manutenção" description="Colocar o painel em modo de manutenção" checked={!form.ativo} onChange={v => handleChange('ativo',!v)} cor={corPrimaria} textColor={textPrimary} textSecondary={textSecondary} bg={bgCard} border={borderCard} />
                    </div>
                )}
            </div>

            <style>{`
           .scrollbar-hide::-webkit-scrollbar { display: none; }
           .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

// ===== COMPONENTES PADRONIZADOS =====
interface InputProps { label: string; value: string; onChange?: (value: string) => void; type?: string; icon?: ReactNode; disabled?: boolean; cor?: string; textColor?: string; bg?: string; border?: string }
const Input = ({ label, value, onChange, type = 'text', icon, disabled, cor = '#3B82F6', textColor = 'white', bg = 'bg-white/5', border = 'border-white/10' }: InputProps) => (
    <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-3.5" style={{ color: textColor }}>{icon}</div>}
            <input type={type} value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} className={`w-full ${icon? 'pl-12' : 'px-4'} py-3 ${bg} ${border} rounded-xl focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ color: textColor, boxShadow: `0 0 0 2px ${cor}20` }} />
        </div>
    </div>
)

interface SelectProps { label: string; value: string; onChange: (value: string) => void; options: Option[]; cor?: string; textColor?: string; isClaro?: boolean; bg?: string; border?: string }
const CustomSelect = ({ label, value, onChange, options, cor = '#3B82F6', textColor = 'white', isClaro = false, bg = 'bg-white/5', border = 'border-white/10' }: SelectProps) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = options.find(o => o.value === value)
    useEffect(() => { const handler = (e: MouseEvent) => { if (ref.current &&!ref.current.contains(e.target as Node)) setOpen(false) }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler) }, [])

    return (
        <div ref={ref} className="relative">
            <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{label}</label>
            <button type="button" onClick={() => setOpen(!open)} className={`w-full px-4 py-3 ${bg} ${border} rounded-xl flex items-center justify-between text-left transition`} style={{ color: textColor }}>
                <span>{selected?.label || 'Selecione'}</span>
                <ChevronDown className={`w-5 h-5 transition ${open? 'rotate-180' : ''}`} style={{ color: textColor }} />
            </button>
            {open && (
                <div className="absolute z-20 w-full mt-2 rounded-xl shadow-2xl overflow-hidden border" style={{ backgroundColor: isClaro? '#FFFFFF' : '#1A1A1A', borderColor: isClaro? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                    <div className="max-h-60 overflow-y-auto">
                        {options.map(opt => (
                            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false) }}
                                className={`w-full text-left px-4 py-3 transition hover:bg-black/5`}
                                style={{ color: value === opt.value? cor : textColor, backgroundColor: value === opt.value? `${cor}20` : 'transparent' }}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface ColorPickerProps { label: string; value: string; onChange: (value: string) => void; textColor?: string; bg?: string; border?: string }
const ColorPicker = ({ label, value, onChange, textColor = 'white', bg = 'bg-white/5', border = 'border-white/10' }: ColorPickerProps) => (
    <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{label}</label>
        <div className="flex items-center gap-3">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className={`w-14 h-12 ${bg} ${border} rounded-xl cursor-pointer p-1`} />
            <input type="text" value={value} onChange={e => onChange(e.target.value)} className={`flex-1 px-4 py-3 ${bg} ${border} rounded-xl focus:outline-none focus:ring-2 transition uppercase`} style={{ color: textColor }} />
        </div>
    </div>
)

interface ToggleProps { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void; cor?: string; textColor?: string; textSecondary?: string; bg?: string; border?: string }
const Toggle = ({ label, description, checked, onChange, cor = '#3B82F6', textColor = 'white', textSecondary = '#9CA3AF', bg = 'bg-white/5', border = 'border-white/10' }: ToggleProps) => (
    <div className={`flex items-center justify-between p-4 ${bg} ${border} rounded-xl`}>
        <div>
            <p className="font-medium" style={{ color: textColor }}>{label}</p>
            {description && <p className="text-sm" style={{ color: textSecondary }}>{description}</p>}
        </div>
        <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full transition`} style={{ backgroundColor: checked? cor : 'rgba(128,128,128,0.3)' }}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked? 'translate-x-6' : 'translate-x-1'}`}></div>
        </button>
    </div>
)

interface UploadBoxProps { label: string; currentUrl?: string; fileName?: string; onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void; cor?: string; onRemove: () => void; textColor?: string; bg?: string; border?: string }
const UploadBox = ({ label, currentUrl, fileName, onFileSelect, cor = '#3B82F6', onRemove, textColor = 'white', bg = 'bg-white/5', border = 'border-white/10' }: UploadBoxProps) => (
    <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: textColor }}>{label}</label>
        <div className={`flex flex-col items-center gap-3 p-4 ${bg} ${border} rounded-xl`}>
            {currentUrl? <img src={currentUrl} alt={label} className="w-20 h-20 object-contain rounded-lg bg-white/5 p-2 flex-shrink-0" /> : <div className={`w-20 h-20 rounded-lg ${bg} border-dashed ${border} flex items-center justify-center flex-shrink-0`}><ImageIcon className="w-8 h-8 text-gray-500" /></div>}
            <div className="flex-1 w-full text-center">
                <label className="w-full px-4 py-2.5 rounded-lg font-semibold cursor-pointer inline-flex items-center justify-center gap-2 transition hover:opacity-90" style={{ backgroundColor: `${cor}20`, color: cor }}>
                    <Upload className="w-4 h-4" /> {fileName? 'Trocar' : 'Selecionar'}
                    <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
                </label>
                <p className="text-xs mt-2 truncate" style={{ color: textColor }}>{fileName || 'Nenhum ficheiro'}</p>
            </div>
            {currentUrl && <button onClick={onRemove} className="p-2 hover:bg-black/10 rounded-lg"><X className="w-4 h-4" style={{ color: textColor }} /></button>}
        </div>
    </div>
)
