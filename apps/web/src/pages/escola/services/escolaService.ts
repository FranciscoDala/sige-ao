import { api } from '../../../services/api'
import { Escola, CreateEscolaPayload } from '../types/escola.types'

export const escolaService = {
    listar: () => api.get<Escola[]>('/escolas'),

    criar: (data: CreateEscolaPayload) =>
        api.post<Escola>('/escolas', data), // 👈 Backend tem que criar escola + vincular diretor

    atualizar: (id: string, data: Partial<Escola>) =>
        api.put<Escola>(`/escolas/${id}`, data),

    desativar: (id: string) =>
        api.patch(`/escolas/${id}/desativar`),

    ativar: (id: string) =>
        api.patch(`/escolas/${id}/ativar`)
}
