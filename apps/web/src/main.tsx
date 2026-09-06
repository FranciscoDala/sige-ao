import { useState } from 'react'
import { School, Save, Upload, Palette, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export default function DefinicoesEscolaPage() {
    const [loading, setLoading] = useState(false)

    // Estados provisórios - depois ligamos na API
    const [nomeEscola, setNomeEscola] = useState('Escola Primária do Futuro')
    const [anoLetivo, setAnoLetivo] = useState('2026')
    const [corPrimaria, setCorPrimaria] = useState('#3B82F6')

    const handleSave = async () => {
        setLoading(true)
        try {
            // TODO: Ligar na API depois
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success('Definições salvas com sucesso!')
        } catch (error) {
            toast.error('Erro ao salvar definições')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-white">Definições da Escola</h1>
                <p className="text-gray-400 text-sm">Configure as informações básicas do painel da sua escola</p>
            </div>

            {/* CARD 1: INFORMAÇÕES GERAIS */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <School className="w-6 h-6 text-[#3B82F6]" />
                    <h2 className="text-lg font-semibold text-white">Informações Gerais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-white/80 mb-2 block">Nome da Escola</label>
                        <input
                            type="text"
                            value={nomeEscola}
                            onChange={(e) => setNomeEscola(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]"
                            placeholder="Digite o nome da escola"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-white/80 mb-2 block">Ano Letivo</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={anoLetivo}
                                onChange={(e) => setAnoLetivo(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]"
                                placeholder="2026"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 2: LOGO */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Upload className="w-6 h-6 text-[#3B82F6]" />
                    <h2 className="text-lg font-semibold text-white">Logo da Escola</h2>
                </div>

                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Arraste a logo aqui ou clique para enviar</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG até 2MB</p>
                </div>
            </div>

            {/* CARD 3: PERSONALIZAÇÃO */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-6 h-6 text-[#3B82F6]" />
                    <h2 className="text-lg font-semibold text-white">Personalização</h2>
                </div>

                <div>
                    <label className="text-sm text-white/80 mb-2 block">Cor Primária do Painel</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={corPrimaria}
                            onChange={(e) => setCorPrimaria(e.target.value)}
                            className="w-14 h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
                        />
                        <input
                            type="text"
                            value={corPrimaria}
                            onChange={(e) => setCorPrimaria(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                    </div>
                </div>
            </div>

            {/* BOTÃO SALVAR */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold rounded-xl flex items-center gap-2 hover:scale-[1.02] transition disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Salvando...' : 'Salvar Definições'}
                </button>
            </div>
        </div>
    )
}
