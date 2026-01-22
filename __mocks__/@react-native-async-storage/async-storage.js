// Manual mock for AsyncStorage
const AsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(null)),
  setItem: jest.fn((key, value) => Promise.resolve()),
  removeItem: jest.fn((key) => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

export default AsyncStorage;
