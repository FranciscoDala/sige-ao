export interface Escola {
    id: string;
    nome: string;
    codigo_minedu?: string;
    provincia: string;
    municipio: string;
    ativo: boolean;
    created_at: string;
    total_alunos?: number;
    total_professores?: number;
}

export interface CreateEscolaPayload {
    nome: string;
    codigo_minedu?: string;
    provincia: string;
    municipio: string;
    endereco?: string;
    telefone?: string;
    email?: string;

    // Dados do Diretor que será criado junto
    diretor_nome: string;
    diretor_email: string;
    diretor_password: string;
}
