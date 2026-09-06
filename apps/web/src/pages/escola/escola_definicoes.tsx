import { useState, ReactNode } from 'react'
import {
  School, Save, Upload, Palette, MapPin, Settings, Building2,
  Mail, Phone, Image, Globe, ToggleLeft, Info
} from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'identificacao' | 'contato' | 'visual' | 'modulos' | 'avancado'

type EscolaForm = {
    nome: string;
    sigla: string;
    id_curto: string;
    nif: string;
    nivel_ensino: string;
    email: string;
    telefone: string;
    endereco: string;
    provincia: string;
    municipio: string;
    logo_url: string;
    banner_url: string;
    favicon_url: string;
    cor_primaria: string;
    cor_secundaria: string;
    cor_fundo: string;
    tema: string;
    fonte_titulo: string;
    fonte_corpo: string;
    estilo_card: string;
    permitir_auto_cadastro: boolean;
    usar_modulo_propina: boolean;
    usar_modulo_biblioteca: boolean;
    ativo: boolean;
}

export default function DefinicoesEscolaPage() {
    const [activeTab, setActiveTab] = useState<Tab>('identificacao')
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState<EscolaForm>({
        nome: 'Escola Primária do Futuro',
        sigla: 'EPF',
        id_curto: 'EPF001',
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
        fonte_titulo: 'Poppins',
        fonte_corpo: 'Inter',
        estilo_card: 'arredondado',
        permitir_auto_cadastro: false,
        usar_modulo_propina: true,
        usar_modulo_biblioteca: false,
        ativo: true,
    })

    const handleChange = <K extends keyof EscolaForm>(key: K, value: EscolaForm[K]) => {
        setForm(prev => ({...prev, [key]: value }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Definições salvas com sucesso!')
        } catch (error) {
            toast.error('Erro ao salvar definições')
        } finally {
            setLoading(false)
        }
    }

    const tabs: {id: Tab, label: string, icon: any}[] = [
        { id: 'identificacao', label: 'Identificação', icon: Building2 },
        { id: 'contato', label: 'Contato', icon: MapPin },
        { id: 'visual', label: 'Visual', icon: Palette },
        { id: 'modulos', label: 'Módulos', icon: Settings },
        { id: 'avancado', label: 'Avançado', icon: Info },
    ]

    return (
        <div className="space-y-4 lg:space-y-6">
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">Definições da Escola</h1>
                <p className="text-gray-400 text-sm">Personalize as informações e aparência do painel</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition flex-shrink-0
                                ${isActive? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 lg:p-6">
                {activeTab === 'identificacao' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Building2 className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Identificação</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome Completo" value={form.nome} onChange={v => handleChange('nome', v)} />
                            <Input label="Sigla" value={form.sigla} onChange={v => handleChange('sigla', v)} />
                            <Input label="ID Curto" value={form.id_curto} onChange={v => handleChange('id_curto', v)} />
                            <Input label="NIF" value={form.nif} onChange={v => handleChange('nif', v)} />
                            <Select label="Nível de Ensino" value={form.nivel_ensino} onChange={v => handleChange('nivel_ensino', v)} options={['PRIMARIO', 'SECUNDARIO', 'TECNICO', 'UNIVERSITARIO']} />
                        </div>
                    </div>
                )}
                {activeTab === 'visual' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4"><Palette className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Aparência</h2></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <UploadBox label="Logo" />
                            <UploadBox label="Banner" />
                            <UploadBox label="Favicon" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ColorPicker label="Cor Primária" value={form.cor_primaria} onChange={v => handleChange('cor_primaria', v)} />
                            <ColorPicker label="Cor Secundária" value={form.cor_secundaria} onChange={v => handleChange('cor_secundaria', v)} />
                            <ColorPicker label="Cor Fundo" value={form.cor_fundo} onChange={v => handleChange('cor_fundo', v)} />
                        </div>
                    </div>
                )}
                {activeTab === 'modulos' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4"><Settings className="w-5 h-5 text-[#3B82F6]" /><h2 className="text-lg font-semibold text-white">Módulos</h2></div>
                        <Toggle label="Módulo de Propinas" checked={form.usar_modulo_propina} onChange={v => handleChange('usar_modulo_propina', v)} />
                        <Toggle label="Módulo Biblioteca" checked={form.usar_modulo_biblioteca} onChange={v => handleChange('usar_modulo_biblioteca', v)} />
                    </div>
                )}
            </div>

            <div className="flex justify-end sticky bottom-0 py-4">
                <button onClick={handleSave} disabled={loading} className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save className="w-5 h-5" /> {loading? 'Salvando...' : 'Salvar Definições'}
                </button>
            </div>
        </div>
    )
}

// ===== COMPONENTES TIPADOS =====
interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    icon?: ReactNode;
}
const Input = ({ label, value, onChange, type = 'text', icon }: InputProps) => (
    <div>
        <label className="text-sm text-white/80 mb-2 block">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-3.5 text-gray-400">{icon}</div>}
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon? 'pl-12' : 'px-4'} py-3 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]`}/>
        </div>
    </div>
)

interface SelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}
const Select = ({ label, value, onChange, options }: SelectProps) => (
    <div>
        <label className="text-sm text-white/80 mb-2 block">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]">
            {options.map((opt) => <option key={opt} value={opt} className="bg-[#1E293B]">{opt}</option>)}
        </select>
    </div>
)

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}
const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
    <div>
        <label className="text-sm text-white/80 mb-2 block">{label}</label>
        <div className="flex items-center gap-3">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-14 h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
            <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]" />
        </div>
    </div>
)

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}
const Toggle = ({ label, checked, onChange }: ToggleProps) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <p className="text-white font-medium">{label}</p>
        <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full transition ${checked? 'bg-[#3B82F6]' : 'bg-white/20'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked? 'translate-x-6' : 'translate-x-1'}`}></div>
        </button>
    </div>
)

interface UploadBoxProps {
    label: string;
}
const UploadBox = ({ label }: UploadBoxProps) => (
    <div>
        <label className="text-sm text-white/80 mb-2 block">{label}</label>
        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#3B82F6] transition cursor-pointer">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">Enviar {label}</p>
        </div>
    </div>
)
