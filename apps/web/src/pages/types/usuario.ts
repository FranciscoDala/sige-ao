export interface UsuarioMinisterio {
    id: string
    nome: string
    email: string
    telefone?: string | null
    nivel: 'MINISTERIO' | 'DIRETOR' | 'DIRECAO'
    escola_id?: string | null
    perfil: 'super_admin' | 'admin' | 'diretor' | 'suporte'
    ativo: boolean
    departamento: string
    created_at: string
}
