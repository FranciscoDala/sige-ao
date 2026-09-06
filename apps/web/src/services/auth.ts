export interface UserData {
    id: string;
    email: string;
    nome: string;
    escola_id?: string | null // 👈 backend manda null
    nivel: string
}

export interface LoginData {
    access_token: string;
    nivel: string;
    user: UserData
}

export const authService = {
    login: (data: LoginData) => {
        const userToSave: UserData = {
            ...data.user,
            escola_id: data.user.escola_id ?? undefined // 👈 converte null pra undefined antes de salvar
        }

        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('nivel', data.nivel)
        localStorage.setItem('user', JSON.stringify(userToSave))
        console.log('[AUTH] Token salvo:', data.access_token.substring(0,20))
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
    getEscolaId: (): string | undefined => { // 👈 CORRIGIDO AQUI
        const user = authService.getUser()
        return user?.escola_id ?? undefined // 👈 força null virar undefined
    },
    isAuthenticated: (): boolean => !!localStorage.getItem('access_token')
}
