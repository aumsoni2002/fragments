// tests/unit/delete.test.js

const app = require('../../src/app');
const request = require('supertest');

describe('Testing DELETE /v1/fragments/:id', () => {
  test('Requests without authentication are rejected.', async () => {
    const res = await request(app).delete('/v1/fragments/id');
    expect(res.statusCode).toBe(401);
  });

  test('wrong credentials are rejected', async () => {
    const res = await request(app)
      .delete('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password');
    expect(res.statusCode).toBe(401);
  });

  test('One can remove a fragment', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .delete(`/v1/fragments/${createdFragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('removing a fragment that does not exist should throw error', async () => {
    const res = await request(app)
      .delete('/v1/fragments/non-existent')
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBeDefined;
  });
});
