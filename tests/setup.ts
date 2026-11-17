import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Setup default test environment variables before module imports
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/airquality_test';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

