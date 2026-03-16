import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server'; 

// 1. Start the MSW server before running all tests
beforeAll(() => server.listen());

// 2. Clean up after each test
afterEach(() => {
    cleanup();              // Tar bort React-komponenten från "låtsas-skärmen"
    server.resetHandlers(); // Rensar eventuella tillfälliga ändringar i mocks
});

// 3. Shut down the server when all tests are complete
afterAll(() => server.close());
