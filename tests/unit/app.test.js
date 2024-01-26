const request = require('supertest');
const app = require('../../src/app');

describe('404 Handler', () => {
  // Test if the 404 handler returns the expected JSON response
  test('should handle not found (404)', async () => {
    const res = await request(app).get('/nonexistent-route');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBe('not found');
  });
});
