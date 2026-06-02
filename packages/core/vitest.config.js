import { defineConfig } from 'vitest/config';

// TODO: Configurar e rodar analise de cobertura

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
        ],
    },
});