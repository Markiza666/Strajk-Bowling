import { defineConfig } from 'vitest/config'; // For proper TS types
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true, // Allows us to use 'describe' and 'it' without importing them
        environment: 'jsdom', // Simulates a browser environment in the terminal
        setupFiles: ['./src/setupTests.ts'], // Points to the setup file
    },
});