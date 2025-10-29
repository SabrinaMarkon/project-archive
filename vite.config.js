import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
        // WSL2-specific optimizations
        watch: {
            usePolling: true,  // More stable file watching on WSL2
            interval: 1000,     // Check for changes every second
        },
    },
    // Reduce memory pressure
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: undefined, // Prevent unnecessary code splitting
            },
        },
    },
    // Optimize caching
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./resources/js/test-setup.ts'],
    },
});
