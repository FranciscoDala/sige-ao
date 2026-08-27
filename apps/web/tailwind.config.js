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
            }
        },
    },
    plugins: [],
}
