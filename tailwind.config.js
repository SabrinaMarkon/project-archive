import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: '#5a5a5a',
                        lineHeight: '1.75',
                        p: {
                            marginTop: '1.25em',
                            marginBottom: '1.25em',
                        },
                        'code::before': {
                            content: '""',
                        },
                        'code::after': {
                            content: '""',
                        },
                        code: {
                            color: '#2d2d2d',
                            backgroundColor: '#f3f4f6',
                            padding: '0.2em 0.4em',
                            borderRadius: '0.25rem',
                            fontWeight: '600',
                        },
                        'pre code': {
                            backgroundColor: 'transparent',
                            padding: '0',
                        },
                        pre: {
                            backgroundColor: '#1f2937',
                            color: '#e5e7eb',
                            overflowX: 'auto',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                        },
                        h2: {
                            color: '#2d2d2d',
                            marginTop: '2em',
                            marginBottom: '1em',
                        },
                        h3: {
                            color: '#2d2d2d',
                            marginTop: '1.6em',
                            marginBottom: '0.6em',
                        },
                        strong: {
                            color: '#2d2d2d',
                        },
                    },
                },
            },
        },
    },

    plugins: [forms, typography],
};
