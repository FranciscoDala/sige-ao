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
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('nivel', data.nivel)
        localStorage.setItem('user', JSON.stringify(data.user))
    },
    logout: () => {
        localStorage.clear()
    },
    getToken: (): string | null => localStorage.getItem('token'),
    getNivel: (): string | null => localStorage.getItem('nivel'),
    getUser: (): UserData | null => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },
    isAuthenticated: (): boolean => !!localStorage.getItem('token')
}
