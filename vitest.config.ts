import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
    oxc: false,
    test: {
        globals: true,
        root: './',
    },
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
    ],
});