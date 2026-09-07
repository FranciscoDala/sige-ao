import { useState, useEffect } from 'react'
import { useEscolas, useCreateEscola } from './hooks/useEscolas'
import { Button } from '../../components/ui/button'
import { Plus, Building2 } from 'lucide-react'
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

    const textPrimary = isClaro? '#1E293B' : 'white'
    const textSecondary = isClaro? '#475569' : '#9CA3AF'

    if (isLoading) return <p style={{ color: textPrimary }}>Carregando...</p>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>
                    <Building2 style={{ color: corPrimaria }} /> Gestão de Escolas
                </h1>
                <Button
                    onClick={() => { }} // 👈 VAZIO POR ENQUANTO
                    className="h-11 px-5 font-semibold hover:opacity-90 transition"
                    style={{
                        background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                        color: 'white',
                        borderRadius: estiloCard === 'quadrado'? '0.5rem' : estiloCard === 'minimalista'? '0.25rem' : '0.75rem'
                    }}
                >
                    <Plus className="mr-2 h-4 w-4 text-white" /> Nova Escola
                </Button>
            </div>

            {/* 👇 GRID VAZIO POR ENQUANTO */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Sem cards por enquanto */}
            </div>
        </div>
    )
}
