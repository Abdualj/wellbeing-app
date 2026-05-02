// Jest setup file
// Note: window.location.assign cannot be mocked in jsdom due to read-only restrictions
// Tests should avoid checking window.location.assign calls

// Mock global.fetch
global.fetch = jest.fn();

// Mock window.alert - use Object.defineProperty to bypass read-only restriction
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  writable: true,
  configurable: true,
  value: mockAlert
});
global.alert = mockAlert;