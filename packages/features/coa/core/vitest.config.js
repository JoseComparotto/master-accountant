import { defineConfig } from 'vitest/config';

// TODO: Unificar configurações num pacote só

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
        ],
        passWithNoTests: true,
        coverage: {
            // 1. Definir o motor de execução
            provider: 'v8', // ou 'istanbul'

            // 2. Tipos de relatório gerados (text exibe no terminal, html gera página web)
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage', // Pasta onde o relatório físico será guardado

            // 3. Incluir apenas o código fonte real da aplicação
            include: ['src/**/*.ts'],

            // 4. Excluir ficheiros que não contêm lógica de negócio pura (boilerplates, contratos, testes)
            exclude: [
                'src/**/*.spec.ts',          // Ficheiros de teste
                'src/**/*.mock.ts',          // Mocks de dados
                'src/**/index.ts',           // Barrel files de exportação automatizados
                '**/node_modules/**',
            ],

            // 5. Thresholds (Limites) - Opcional, mas ideal para pipelines de CI/CD.
            // Se a cobertura descer abaixo destes valores, o comando falha.
            thresholds: {
                statements: 80,
                branches: 75,
                functions: 80,
                lines: 80,
            },
        },
    },
});