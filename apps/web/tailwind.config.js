/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Zalando Sans"', 'ui-sans-serif', 'system-ui'], // <- Nome exato do Google Fonts
                zalando: ['"Zalando Sans"', 'sans-serif'],
                bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
            },
            colors: {
                'primaria': '#16a34a',
                'secundaria': '#22c55e',
            }
        },
    },
    plugins: [],
}
