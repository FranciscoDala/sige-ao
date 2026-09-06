import { useState, useEffect } from 'react'
import { useEscolas, useCreateEscola } from './hooks/useEscolas'
import { Button } from '../../components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
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

    const getCardRadius = () => {
        if (estiloCard === 'quadrado') return 'rounded-lg'
        if (estiloCard === 'minimalista') return 'rounded-sm'
        return 'rounded-2xl' // arredondado
    }

    if (isLoading) return <p className="text-white">Carregando...</p>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Building2 style={{ color: corPrimaria }} /> Gestão de Escolas
                </h1>
                <Button
                    onClick={() => { }}
                    className="text-white font-semibold hover:opacity-90 transition"
                    style={{
                        background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                        borderRadius: estiloCard === 'quadrado' ? '0.5rem' : estiloCard === 'minimalista' ? '0.25rem' : '0.75rem'
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nova Escola
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {escolas?.map(escola => (
                    <Card
                        key={escola.id}
                        className={`${!escola.ativo ? 'opacity-60' : ''} bg-white/5 backdrop-blur-xl border-white/10 ${getCardRadius()} shadow-2xl shadow-black/10 hover:border-opacity-30 transition`}
                        style={{ borderColor: `${corPrimaria}40` }} // borda com cor da escola
                    >
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-white">
                                <span style={{ color: corPrimaria }}>{escola.nome}</span>
                                <Badge
                                    variant={escola.ativo ? 'default' : 'destructive'}
                                    className="text-white"
                                    style={{
                                        backgroundColor: escola.ativo ? corPrimaria : '#EF4444'
                                    }}
                                >
                                    {escola.ativo ? 'Ativa' : 'Inativa'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400">{escola.provincia} - {escola.municipio}</p>
                            <p className="text-sm text-gray-300 mt-1">Alunos: {escola.total_alunos || 0}</p>

                            {/* Barra de progresso com cor da escola */}
                            <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
                                <div
                                    className="h-1.5 rounded-full transition-all"
                                    style={{
                                        width: `${Math.min((escola.total_alunos || 0) / 100 * 10, 100)}%`,
                                        background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
