/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'sige-blue': '#2563eb',
                'sige-dark': '#0f172a',
                'primaria': '#16a34a',      // verde SIGE
                'secundaria': '#22c55e',
                'card': '#171717',
                'fundo': '#000',
                'borda': '#2a2a2a',
            },
            fontFamily: {
                sans: ['Zalando', 'ui-sans-serif', 'system-ui'], // <- AQUI
            },
            borderRadius: {
                'padrao': '0.75rem',
                'sm': '0.5rem',
            }
        },
    },
    plugins: [],
}
