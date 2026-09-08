import { useState, useEffect } from 'react'
import { useEscolas, useCreateEscola } from './hooks/useEscolas'
import { Button } from '../../components/ui/button'
import { Plus, Building2, Loader2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'

export default function EscolaListPage() {
    const { data: escolas, isLoading } = useEscolas()
    const createEscola = useCreateEscola()
    const [tema, setTema] = useState<any>(null)

    // 👇 Pega tema do localStorage e escuta atualização
    useEffect(() => {
        const loadTema = () => {
            const t = localStorage.getItem('escola_tema')
            if (t) setTema(JSON.parse(t))
        }
        loadTema()
        window.addEventListener('escola-tema-updated', loadTema)
        return () => window.removeEventListener('escola-tema-updated', loadTema)
    }, [])

    const corPrimaria = tema?.cor_primaria || '#3B82F6'
    const corSecundaria = tema?.cor_secundaria || '#8B5CF6'
    const estiloCard = tema?.estilo_card || 'arredondado'
    const isClaro = tema?.tema === 'claro'

    const getCardRadius = () => {
        if (estiloCard === 'quadrado') return 'rounded-lg'
        if (estiloCard === 'minimalista') return 'rounded-sm'
        return 'rounded-2xl' // arredondado
    }

    const getCardStyle = () => {
        const baseClaro = `bg-white border-black/10`
        const baseEscuro = `bg-white/5 backdrop-blur-xl border-white/10`
        const base = isClaro? baseClaro : baseEscuro

        if (estiloCard === 'quadrado') return `${base} rounded-lg`
        if (estiloCard === 'minimalista') return `${base} rounded-lg border-0`
        if (estiloCard === 'elevado') return `${base} rounded-2xl shadow-2xl`
        if (estiloCard === 'borda_colorida') return `${base} rounded-2xl border-2 border-[var(--cor-primaria)]`
        if (estiloCard === 'glass') return isClaro? `${baseClaro} rounded-2xl` : `bg-white/10 backdrop-blur-2xl border-white/10 rounded-2xl`
        return `${base} rounded-2xl` // arredondado
    }

    const textPrimary = isClaro? '#1E293B' : 'white'
    const textSecondary = isClaro? '#475569' : '#9CA3AF'
    const bgCard = isClaro? 'bg-black/5' : 'bg-white/5'
    const borderCard = isClaro? 'border-black/10' : 'border-white/10'
    const hoverBg = isClaro? 'hover:bg-black/5' : 'hover:bg-white/10'

    if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin" style={{ color: corPrimaria }} /></div>

    return (
        // ESPAÇO MENOR: p-6 -> p-2 lg:p-4 e space-y-6 -> space-y-4
        <div className="p-2 lg:p-4 space-y-4">
            {/* HEADER MAIS COMPACTO: gap-4 -> gap-3 */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>
                    {/* ICONE MENOR: sem size -> w-5 h-5 */}
                    <Building2 className="w-5 h-5" style={{ color: corPrimaria }} /> Gestão de Escolas
                </h1>
                {/* BOTAO MENOR: h-11 -> h-10 px-5 -> px-4 */}
                <Button
                    onClick={() => { }} // 👈 VAZIO POR ENQUANTO
                    className="w-full lg:w-auto h-10 px-4 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
                    style={{
                        background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                        color: 'white',
                        borderRadius: estiloCard === 'quadrado'? '0.5rem' : estiloCard === 'minimalista'? '0.25rem' : '0.75rem'
                    }}
                >
                    <Plus className="h-3.5 w-3.5 text-white" /> Nova Escola
                </Button>
            </div>

            {/* GRID MAIS COMPACTO: gap-4 -> gap-3 */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {/* EXEMPLO DE CARD VAZIO NO PADRÃO */}
                {escolas?.length === 0 && (
                    <div className={`${getCardStyle()} ${borderCard} p-4 col-span-full`}>
                        <p className="text-center text-sm" style={{ color: textSecondary }}>Nenhuma escola cadastrada</p>
                    </div>
                )}

                {escolas?.map((escola: any) => (
                    <div key={escola.id} className={`${getCardStyle()} ${borderCard} p-4 ${hoverBg} transition cursor-pointer`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${corPrimaria}20` }}>
                                <Building2 className="w-5 h-5" style={{ color: corPrimaria }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: textPrimary }}>{escola.nome}</p>
                                <p className="text-xs truncate" style={{ color: textSecondary }}>{escola.sigla} • {escola.provincia}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Badge style={{ backgroundColor: `${corPrimaria}20`, color: corPrimaria }} className="text-[10px] px-2 py-0.5">
                                {escola.nivel_ensino}
                            </Badge>
                            <Badge variant={escola.ativo? "default" : "secondary"} className="text-[10px] px-2 py-0.5">
                                {escola.ativo? 'Ativa' : 'Inativa'}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
