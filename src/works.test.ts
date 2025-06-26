import { describe, expect, test } from '@jest/globals';

describe('smoke test for a testing environment', () => {
  test('jest is configured and runs without errors', () => {
    expect(true).toBe(true);
  });
});
