export interface UserData {
    id: string;
    email: string;
    nome: string;
    escola_id?: string | null
    nivel: string
}

export interface LoginData {
    access_token: string;
    nivel: string;
    user: UserData
}

export const authService = {
    login: (data: any) => { // 👈 mudei pra any pra não quebrar
        // 👇 PEGA O NIVEL DE ONDE VIER
        const nivel = data.nivel || data.user?.nivel || data.user?.NivelAcesso || 'DIRETOR'

        const userToSave: UserData = {
            ...data.user,
            nivel: nivel, // 👈 FORÇA O NIVEL CORRETO DENTRO DO USER TAMBEM
            escola_id: data.user.escola_id ?? undefined
        }

        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('nivel', nivel) // 👈 SALVA O QUE ACHOU
        localStorage.setItem('user', JSON.stringify(userToSave))
        console.log('[AUTH] Token salvo:', data.access_token.substring(0,20))
        console.log('[AUTH] Nivel salvo:', nivel) // 👈 NOVO DEBUG
    },
    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('nivel')
        localStorage.removeItem('user')
    },
    getToken: (): string | null => localStorage.getItem('access_token'),
    getNivel: (): string | null => localStorage.getItem('nivel'),
    getUser: (): UserData | null => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },
    getEscolaId: (): string | undefined => {
        const user = authService.getUser()
        return user?.escola_id ?? undefined
    },
    isAuthenticated: (): boolean => !!localStorage.getItem('access_token')
}
