export interface UserData {
    id: string;
    email: string;
    nome: string;
    escola_id?: string | null
    escola_nome?: string // 👈 NOVO: pra mostrar no header
    nivel: string
}

export const authService = {
    login: (data: any) => {
        const nivel = data.nivel || data.user?.nivel || data.user?.NivelAcesso || 'DIRETOR'

        const userToSave: UserData = {
           ...data.user,
            nivel: nivel,
            escola_id: data.user?.escola_id ?? data.user?.escola?.id ?? undefined, // 👈 PEGA DOS 2 LUGARES
            escola_nome: data.user?.escola?.nome ?? undefined // 👈 SALVA O NOME PRA HEADER
        }

        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('nivel', nivel)
        localStorage.setItem('user', JSON.stringify(userToSave))

        // 👇 SE VIER TEMA DO LOGIN, SALVA TAMBEM
        if (data.user?.escola) {
            localStorage.setItem('escola_tema', JSON.stringify(data.user.escola))
            window.dispatchEvent(new Event('escola-tema-updated')) // 👈 APLICA NA HORA NO LOGIN
        }
    },
    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('nivel')
        localStorage.removeItem('user')
        localStorage.removeItem('escola_tema') // 👈 LIMPA TEMA
        window.location.replace('/#/')
    },
    getToken: (): string | null => localStorage.getItem('access_token'),
    getNivel: (): string | null => localStorage.getItem('nivel'),
    getUser: (): UserData | null => {
        const user = localStorage.getItem('user')
        return user? JSON.parse(user) : null
    },
    getEscolaId: (): string | undefined => {
        const user = authService.getUser()
        return user?.escola_id?? undefined
    },
    isAuthenticated: (): boolean =>!!localStorage.getItem('access_token')
}
