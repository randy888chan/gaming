// Mock fetch globally
global.fetch = function() {
  return Promise.resolve({
    json: function() { return Promise.resolve({}); },
    text: function() { return Promise.resolve(""); },
    ok: true,
    status: 200,
  });
};

// Mock process.env
process.env.NODE_ENV = "test";
process.env.DB = undefined; // Mock DB for tests