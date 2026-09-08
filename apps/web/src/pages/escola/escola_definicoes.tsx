import { useState, useEffect, ReactNode, ChangeEvent, useRef } from 'react'
import {
  Save,
  Upload,
  Palette,
  MapPin,
  Settings,
  Building2,
  Mail,
  Phone,
  Info,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../../services/auth'

// ✅ sem import inexistente
const API_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8000')
    .replace(/\/+$/, '') + '/api/v1'

type Tab = 'identificacao' | 'contato' | 'visual' | 'modulos' | 'avancado'
type Option = { value: string; label: string }

type EscolaForm = {
  nome: string
  sigla: string
  id_curto: string
  nif: string
  nivel_ensino: string
  email: string
  telefone: string
  endereco: string
  provincia: string
  municipio: string
  logo_url: string
  banner_url: string
  favicon_url: string
  cor_primaria: string
  cor_secundaria: string
  cor_fundo: string
  tema: string
  fonte_titulo: string
  fonte_corpo: string
  estilo_card: string
  permitir_auto_cadastro: boolean
  usar_modulo_propina: boolean
  usar_modulo_biblioteca: boolean
  ativo: boolean
}

const TEMA_OPTIONS: Option[] = [
  { value: 'claro', label: 'Claro' },
  { value: 'escuro', label: 'Escuro' },
]

const FONTE_OPTIONS: Option[] = [
  { value: 'Zalando Sans Expanded', label: 'Zalando Sans Expanded' },
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

const getAuthHeaders = (isJson = true) => {
  const token = authService.getToken()
  const headers: Record<string, string> = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (isJson) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

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
    nome: '',
    sigla: '',
    id_curto: '',
    nif: '',
    nivel_ensino: 'PRIMARIO',
    email: '',
    telefone: '',
    endereco: '',
    provincia: '',
    municipio: '',
    logo_url: '',
    banner_url: '',
    favicon_url: '',
    cor_primaria: '#0056b3',
    cor_secundaria: '#FFC107',
    cor_fundo: '#FFFFFF',
    tema: 'claro',
    fonte_titulo: 'Zalando Sans Expanded',
    fonte_corpo: 'Zalando Sans Expanded',
    estilo_card: 'arredondado',
    permitir_auto_cadastro: false,
    usar_modulo_propina: true,
    usar_modulo_biblioteca: false,
    ativo: true,
  })

  const corPrimaria = form.cor_primaria || '#3B82F6'
  const corSecundaria = form.cor_secundaria || '#8B5CF6'
  const isClaro = form.tema === 'claro'
  const textPrimary = isClaro ? '#1E293B' : 'white'
  const textSecondary = isClaro ? '#64748B' : '#9CA3AF'
  const bgCard = isClaro ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
  const borderCard = isClaro ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'

  useEffect(() => {
    const fetchEscola = async () => {
      try {
        const res = await fetch(`${API_URL}/escolas/me`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Erro ao carregar dados da escola')
        }

        const data = await res.json()
        setForm((prev) => ({ ...prev, ...data }))
        setLogoPreview(data.logo_url || null)
        setBannerPreview(data.banner_url || null)
        setFaviconPreview(data.favicon_url || null)

        const userAtual = authService.getUser()
        if (userAtual && data.nome) {
          localStorage.setItem(
            'user',
            JSON.stringify({ ...userAtual, escola_nome: data.nome })
          )
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
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleFileChange =
    (type: 'logo' | 'banner' | 'favicon') => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const maxSize = type === 'favicon' ? 1 * 1024 * 1024 : 5 * 1024 * 1024

      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande. Máximo ${maxSize / 1024 / 1024}MB`)
        return
      }

      const url = URL.createObjectURL(file)

      if (type === 'logo') {
        setLogoFile(file)
        setLogoPreview(url)
      }
      if (type === 'banner') {
        setBannerFile(file)
        setBannerPreview(url)
      }
      if (type === 'favicon') {
        setFaviconFile(file)
        setFaviconPreview(url)
      }
    }

  const handleSave = async () => {
    setLoading(true)

    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.')
      }

      const clean = (value: string | undefined) =>
        value?.replace(/´/g, "'").trim() || undefined

      const rawPayload = {
        nome: clean(form.nome),
        sigla: clean(form.sigla),
        nif: clean(form.nif),
        email: clean(form.email),
        telefone: clean(form.telefone),
        endereco: clean(form.endereco),
        provincia: clean(form.provincia),
        municipio: clean(form.municipio),
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

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ''
        )
      )

      const res = await fetch(`${API_URL}/escolas/me/definicoes`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (Array.isArray(err.detail)) {
          throw new Error(
            err.detail
              .map((item: any) => `${item.loc[item.loc.length - 1]}: ${item.msg}`)
              .join(', ')
          )
        }
        throw new Error(err.detail || 'Erro ao salvar dados')
      }

      let updatedData = await res.json()

      const uploadFile = async (file: File, endpoint: string, fieldName: string) => {
        const formData = new FormData()
        formData.append(fieldName, file)

        const fileRes = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!fileRes.ok) {
          const err = await fileRes.json().catch(() => ({}))
          throw new Error(err.detail || `Erro ao salvar ${endpoint}`)
        }

        return fileRes.json()
      }

      if (logoFile) updatedData = await uploadFile(logoFile, '/escolas/me/logo', 'logo')
      if (bannerFile) updatedData = await uploadFile(bannerFile, '/escolas/me/banner', 'file')
      if (faviconFile) updatedData = await uploadFile(faviconFile, '/escolas/me/favicon', 'file')

      const escolaData: EscolaForm = { ...form, ...updatedData }
      setForm(escolaData)
      setLogoPreview(escolaData.logo_url || null)
      setBannerPreview(escolaData.banner_url || null)
      setFaviconPreview(escolaData.favicon_url || null)
      setLogoFile(null)
      setBannerFile(null)
      setFaviconFile(null)

      localStorage.setItem('escola_tema', JSON.stringify(updatedData))
      window.dispatchEvent(new Event('escola-tema-updated'))
      toast.success('Definições salvas com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar definições')
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'identificacao', label: 'Identificação', icon: Building2 },
    { id: 'contato', label: 'Contato', icon: MapPin },
    { id: 'visual', label: 'Visual', icon: Palette },
    { id: 'modulos', label: 'Módulos', icon: Settings },
    { id: 'avancado', label: 'Avançado', icon: Info },
  ]

  if (loadingData) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: corPrimaria }} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6" style={{ color: corPrimaria || '#6366F1' }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: textPrimary }}>
              Definições da Escola
            </h1>
            <p className="text-xs" style={{ color: textSecondary }}>
              Personalize as informações e aparência do painel
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full lg:w-auto h-10 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition text-sm"
          style={{
            background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
            borderRadius:
              form.estilo_card === 'quadrado'
                ? '0.5rem'
                : form.estilo_card === 'minimalista'
                  ? '0.25rem'
                  : '0.75rem',
            color: 'white',
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'white' }} />
              <span style={{ color: 'white' }}>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" style={{ color: 'white' }} />
              <span style={{ color: 'white' }}>Salvar Definições</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full">
        <div className="flex gap-2 p-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 border"
                style={{
                  backgroundColor: isActive ? `${corPrimaria}20` : 'rgba(0,0,0,0.03)',
                  color: isActive ? corPrimaria : textSecondary,
                  borderColor: isActive ? `${corPrimaria}4D` : 'rgba(0,0,0,0.08)',
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? corPrimaria : textSecondary }} />
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="h-0.5 w-full mt-2 rounded-full" style={{ backgroundColor: `${corPrimaria}26` }} />
      </div>

      <div className="rounded-2xl p-0 bg-transparent shadow-none -mt-2">
        {activeTab === 'identificacao' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4" style={{ color: corPrimaria }} />
              <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
                Identificação
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Nome Completo"
                value={form.nome}
                onChange={(v) => handleChange('nome', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <Input
                label="Sigla"
                value={form.sigla}
                onChange={(v) => handleChange('sigla', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <Input
                label="ID Curto"
                value={form.id_curto}
                onChange={() => {}}
                disabled
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <Input
                label="NIF"
                value={form.nif}
                onChange={(v) => handleChange('nif', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <Input
                label="Nível de Ensino"
                value={form.nivel_ensino}
                onChange={() => {}}
                disabled
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
            </div>
          </div>
        )}

        {activeTab === 'contato' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" style={{ color: corPrimaria }} />
              <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
                Contato
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                icon={<Mail className="w-3.5 h-3.5" />}
                value={form.email}
                onChange={(v) => handleChange('email', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <Input
                label="Telefone"
                icon={<Phone className="w-3.5 h-3.5" />}
                value={form.telefone}
                onChange={(v) => handleChange('telefone', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <div className="md:col-span-2">
                <Input
                  label="Endereço"
                  value={form.endereco}
                  onChange={(v) => handleChange('endereco', v)}
                  cor={corPrimaria}
                  textColor={textPrimary}
                  bg={bgCard}
                  border={borderCard}
                />
              </div>
              <Input
                label="Província"
                value={form.provincia}
                onChange={(v) => handleChange('provincia', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <Input
                label="Município"
                value={form.municipio}
                onChange={(v) => handleChange('municipio', v)}
                cor={corPrimaria}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" style={{ color: corPrimaria }} />
              <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
                Aparência
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <UploadBox
                label="Logo da Escola"
                currentUrl={logoPreview || undefined}
                fileName={logoFile?.name}
                onFileSelect={handleFileChange('logo')}
                cor={corPrimaria}
                onRemove={() => {
                  setLogoFile(null)
                  setLogoPreview(form.logo_url)
                }}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <UploadBox
                label="Banner do Painel"
                currentUrl={bannerPreview || undefined}
                fileName={bannerFile?.name}
                onFileSelect={handleFileChange('banner')}
                cor={corPrimaria}
                onRemove={() => {
                  setBannerFile(null)
                  setBannerPreview(form.banner_url)
                }}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <UploadBox
                label="Favicon"
                currentUrl={faviconPreview || undefined}
                fileName={faviconFile?.name}
                onFileSelect={handleFileChange('favicon')}
                cor={corPrimaria}
                onRemove={() => {
                  setFaviconFile(null)
                  setFaviconPreview(form.favicon_url)
                }}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ColorPicker
                label="Cor Primária"
                value={form.cor_primaria}
                onChange={(v) => handleChange('cor_primaria', v)}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <ColorPicker
                label="Cor Secundária"
                value={form.cor_secundaria}
                onChange={(v) => handleChange('cor_secundaria', v)}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
              <ColorPicker
                label="Cor de Fundo"
                value={form.cor_fundo}
                onChange={(v) => handleChange('cor_fundo', v)}
                textColor={textPrimary}
                bg={bgCard}
                border={borderCard}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CustomSelect
                label="Tema"
                value={form.tema}
                onChange={(v) => handleChange('tema', v)}
                options={TEMA_OPTIONS}
                cor={corPrimaria}
                textColor={textPrimary}
                isClaro={isClaro}
                bg={bgCard}
                border={borderCard}
              />
              <CustomSelect
                label="Fonte Título"
                value={form.fonte_titulo}
                onChange={(v) => handleChange('fonte_titulo', v)}
                options={FONTE_OPTIONS}
                cor={corPrimaria}
                textColor={textPrimary}
                isClaro={isClaro}
                bg={bgCard}
                border={borderCard}
              />
              <CustomSelect
                label="Fonte Corpo"
                value={form.fonte_corpo}
                onChange={(v) => handleChange('fonte_corpo', v)}
                options={FONTE_OPTIONS}
                cor={corPrimaria}
                textColor={textPrimary}
                isClaro={isClaro}
                bg={bgCard}
                border={borderCard}
              />
              <CustomSelect
                label="Estilo dos Cards"
                value={form.estilo_card}
                onChange={(v) => handleChange('estilo_card', v)}
                options={ESTILO_CARD_OPTIONS}
                cor={corPrimaria}
                textColor={textPrimary}
                isClaro={isClaro}
                bg={bgCard}
                border={borderCard}
              />
            </div>
          </div>
        )}

        {activeTab === 'modulos' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4" style={{ color: corPrimaria }} />
              <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
                Módulos Ativos
              </h2>
            </div>

            <Toggle
              label="Módulo de Propinas"
              description="Ativa o controle financeiro e emissão de faturas"
              checked={form.usar_modulo_propina}
              onChange={(v) => handleChange('usar_modulo_propina', v)}
              cor={corPrimaria}
              textColor={textPrimary}
              textSecondary={textSecondary}
              bg={bgCard}
              border={borderCard}
            />
            <Toggle
              label="Módulo Biblioteca"
              description="Controle de livros e empréstimos"
              checked={form.usar_modulo_biblioteca}
              onChange={(v) => handleChange('usar_modulo_biblioteca', v)}
              cor={corPrimaria}
              textColor={textPrimary}
              textSecondary={textSecondary}
              bg={bgCard}
              border={borderCard}
            />
            <Toggle
              label="Auto Cadastro"
              description="Permitir que novos usuários se cadastrem"
              checked={form.permitir_auto_cadastro}
              onChange={(v) => handleChange('permitir_auto_cadastro', v)}
              cor={corPrimaria}
              textColor={textPrimary}
              textSecondary={textSecondary}
              bg={bgCard}
              border={borderCard}
            />
          </div>
        )}

        {activeTab === 'avancado' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" style={{ color: corPrimaria }} />
              <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
                Avançado
              </h2>
            </div>

            <div className="p-3 rounded-xl" style={{ background: bgCard, border: `1px solid ${borderCard}` }}>
              <p className="text-sm" style={{ color: textSecondary }}>
                Área para configurações futuras: API Keys, Webhooks, Integrações.
              </p>
            </div>

            <Toggle
              label="Manutenção"
              description="Colocar o painel em modo de manutenção"
              checked={!form.ativo}
              onChange={(v) => handleChange('ativo', !v)}
              cor={corPrimaria}
              textColor={textPrimary}
              textSecondary={textSecondary}
              bg={bgCard}
              border={borderCard}
            />
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

interface InputProps {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  icon?: ReactNode
  disabled?: boolean
  cor?: string
  textColor?: string
  bg?: string
  border?: string
}

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  disabled,
  cor = '#3B82F6',
  textColor = 'white',
  bg = 'rgba(0,0,0,0.03)',
  border = 'rgba(0,0,0,0.1)',
}: InputProps) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block" style={{ color: textColor }}>
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-2.5" style={{ color: textColor }}>
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full ${icon ? 'pl-10' : 'px-3'} py-2.5 rounded-xl focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
        style={{
          color: textColor,
          background: bg,
          border: `1px solid ${border}`,
        }}
      />
    </div>
  </div>
)

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  cor?: string
  textColor?: string
  isClaro?: boolean
  bg?: string
  border?: string
}

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  cor = '#3B82F6',
  textColor = 'white',
  isClaro = false,
  bg = 'rgba(0,0,0,0.03)',
  border = 'rgba(0,0,0,0.1)',
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium mb-1.5 block" style={{ color: textColor }}>
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition text-sm"
        style={{
          color: textColor,
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        <span>{selected?.label || 'Selecione'}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} style={{ color: textColor }} />
      </button>

      {open && (
        <div
          className="absolute z-20 w-full mt-2 rounded-xl shadow-2xl overflow-hidden border"
          style={{ backgroundColor: isClaro ? '#FFFFFF' : '#1A1A1A', borderColor: border }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2.5 transition text-sm"
                style={{
                  color: value === opt.value ? cor : textColor,
                  backgroundColor: value === opt.value ? `${cor}20` : 'transparent',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  textColor?: string
  bg?: string
  border?: string
}

const ColorPicker = ({
  label,
  value,
  onChange,
  textColor = 'white',
  bg = 'rgba(0,0,0,0.03)',
  border = 'rgba(0,0,0,0.1)',
}: ColorPickerProps) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block" style={{ color: textColor }}>
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 rounded-xl cursor-pointer p-1"
        style={{ background: bg, border: `1px solid ${border}` }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition uppercase text-sm"
        style={{ color: textColor, background: bg, border: `1px solid ${border}` }}
      />
    </div>
  </div>
)

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  cor?: string
  textColor?: string
  textSecondary?: string
  bg?: string
  border?: string
}

const Toggle = ({
  label,
  description,
  checked,
  onChange,
  cor = '#3B82F6',
  textColor = 'white',
  textSecondary = '#9CA3AF',
  bg = 'rgba(0,0,0,0.03)',
  border = 'rgba(0,0,0,0.1)',
}: ToggleProps) => (
  <div
    className="flex items-center justify-between p-3 rounded-xl"
    style={{ background: bg, border: `1px solid ${border}` }}
  >
    <div>
      <p className="font-medium text-sm" style={{ color: textColor }}>{label}</p>
      {description && (
        <p className="text-xs" style={{ color: textSecondary }}>
          {description}
        </p>
      )}
    </div>

    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-10 h-5 rounded-full transition"
      style={{ backgroundColor: checked ? cor : 'rgba(128,128,128,0.3)' }}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  </div>
)

interface UploadBoxProps {
  label: string
  currentUrl?: string
  fileName?: string
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void
  cor?: string
  onRemove: () => void
  textColor?: string
  bg?: string
  border?: string
}

const UploadBox = ({
  label,
  currentUrl,
  fileName,
  onFileSelect,
  cor = '#3B82F6',
  onRemove,
  textColor = 'white',
  bg = 'rgba(0,0,0,0.03)',
  border = 'rgba(0,0,0,0.1)',
}: UploadBoxProps) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block" style={{ color: textColor }}>
      {label}
    </label>

    <div
      className="flex flex-col items-center gap-3 p-3 rounded-xl"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {currentUrl ? (
        <img
          src={currentUrl}
          alt={label}
          className="w-16 h-16 object-contain rounded-lg bg-white/5 p-2 flex-shrink-0"
        />
      ) : (
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: bg, border: `1px dashed ${border}` }}
        >
          <ImageIcon className="w-6 h-6 text-gray-500" />
        </div>
      )}

      <div className="flex-1 w-full text-center">
        <label
          className="w-full px-3 py-2 rounded-lg font-semibold cursor-pointer inline-flex items-center justify-center gap-2 transition hover:opacity-90 text-sm"
          style={{ backgroundColor: `${cor}20`, color: cor }}
        >
          <Upload className="w-3.5 h-3.5" />
          {fileName ? 'Trocar' : 'Selecionar'}
          <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
        </label>
        <p className="text-[11px] mt-2 truncate" style={{ color: textColor }}>
          {fileName || 'Nenhum ficheiro'}
        </p>
      </div>

      <button type="button" onClick={onRemove} className="p-1.5 hover:bg-black/10 rounded-lg">
        <X className="w-3.5 h-3.5" style={{ color: textColor }} />
      </button>
    </div>
  </div>
)
