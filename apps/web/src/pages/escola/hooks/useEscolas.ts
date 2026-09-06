import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { escolaService } from '../services/escolaService'
import { toast } from 'sonner'

export function useEscolas() {
    return useQuery({
        queryKey: ['escolas'],
        queryFn: () => escolaService.listar().then(res => res.data)
    })
}

export function useCreateEscola() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: escolaService.criar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escolas'] })
            toast.success('Escola e Diretor criados com sucesso!')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.detail || 'Erro ao criar escola')
        }
    })
}
