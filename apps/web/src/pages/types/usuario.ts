export interface UsuarioMinisterio { // 👈 renomeei pra não confundir
    id: string
    nome: string
    email: string
    perfil: 'super_admin' | 'admin' | 'suporte' // 👈 perfis do ministério
    ativo: boolean
    departamento?: string // 👈 troquei escola por departamento
    telefone?: string
    created_at: string
}
