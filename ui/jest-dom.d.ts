import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

// Liga os matchers do jest-dom ao `expect` do bun:test para o typecheck.
declare module "bun:test" {
  interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  interface AsymmetricMatchers extends TestingLibraryMatchers<typeof expect.stringContaining, unknown> {}
}
