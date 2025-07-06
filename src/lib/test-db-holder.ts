import { D1Database } from '@cloudflare/workers-types';

// Define a basic structure for the D1 mock, aligning with what tests might provide.
// This could be expanded or made more generic if needed.
export interface D1DatabaseMock {
  prepare: jest.Mock<any, any>;
  dump?: jest.Mock<any, any>;
  batch?: jest.Mock<any, any>;
  transaction?: jest.Mock<any, any>;
  // Add other methods your mockD1 might have and that the D1Database type expects,
  // or ensure your mockD1 conforms to D1Database for stricter typing.
}

export const testDbHolder: { instance: D1Database | D1DatabaseMock | null } = {
  instance: null,
};
