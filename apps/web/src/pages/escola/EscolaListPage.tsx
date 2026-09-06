import { useEscolas, useCreateEscola } from './hooks/useEscolas'
import { Button } from '../../components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export default function EscolaListPage() {
    const { data: escolas, isLoading } = useEscolas()
    const createEscola = useCreateEscola()

    if (isLoading) return <p>Carregando...</p>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 /> Gestão de Escolas
                </h1>
                <Button onClick={() => { }}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Escola
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {escolas?.map(escola => (
                    <Card key={escola.id} className={!escola.ativo ? 'opacity-60' : ''}>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                {escola.nome}
                                <Badge variant={escola.ativo ? 'default' : 'destructive'}>
                                    {escola.ativo ? 'Ativa' : 'Inativa'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{escola.provincia} - {escola.municipio}</p>
                            <p className="text-sm">Alunos: {escola.total_alunos || 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
