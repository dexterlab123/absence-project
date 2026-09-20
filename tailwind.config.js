import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                'admin-bg': '#FFFFFF',
                'admin-sidebar': '#F7F7F8',
                'admin-text-primary': '#1A1A1A',
                'admin-text-secondary': '#6B6B6B',
                'admin-border': '#D9D9D9',
                'admin-accent': '#2563EB',
                'admin-red': '#DC2626',
                'admin-green': '#16A34A',
                'admin-amber': '#D97706',
            }
        },
    },

    plugins: [forms],
};
