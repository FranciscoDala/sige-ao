export interface UserData {
    id: string;
    email: string;
    nome: string;
    escola_id?: string
}

export interface LoginData {
    access_token: string;
    nivel: string;
    user: UserData
}

export const authService = {
    login: (data: LoginData) => {
        localStorage.setItem('access_token', data.access_token) // 👈 MUDOU de 'token' para 'access_token'
        localStorage.setItem('nivel', data.nivel)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('[AUTH] Token salvo:', data.access_token.substring(0,20)) // 👈 debug
    },
    logout: () => {
        localStorage.removeItem('access_token') // 👈 MUDOU
        localStorage.removeItem('nivel')
        localStorage.removeItem('user')
    },
    getToken: (): string | null => localStorage.getItem('access_token'), // 👈 MUDOU
    getNivel: (): string | null => localStorage.getItem('nivel'),
    getUser: (): UserData | null => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },
    isAuthenticated: (): boolean => !!localStorage.getItem('access_token') // 👈 MUDOU
}
