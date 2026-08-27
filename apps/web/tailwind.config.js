/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Zalando Sans"', 'ui-sans-serif', 'system-ui'],
                bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
            },
            colors: {
                'primaria': '#0a4a8a',  // <- AZUL
                'secundaria': '#1e90ff',
                'terciaria': '#00c6ff',
            }
        },
    },
    plugins: [],
}
