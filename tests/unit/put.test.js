// tests/unit/put.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('Testing PUT /v1/fragments/:id', () => {
  test('Should deny unauthenticated requests', async () => {
    const res = await request(app).put('/v1/fragments/id');
    expect(res.statusCode).toBe(401);
  });

  test('wrong credentials are rejected', async () => {
    const res = await request(app)
      .put('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password');
    expect(res.statusCode).toBe(401);
  });

  test('One can update a fragment with the same type of content.', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a Test fragment');

    const newFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .put(`/v1/fragments/${newFragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a Test fragment with changes');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toBe(36);
    expect(res.body.fragment.created).not.toEqual(res.body.fragment.updated);
  });

  test('One cannot update a fragment with the different type of content.', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a Test fragment');

    const newFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .put(`/v1/fragments/${newFragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/md')
      .send('This is a Test fragment with changes');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('A fragment that does not exist cannot be updated', async () => {
    const res = await request(app)
      .put(`/v1/fragments/non-existent`)
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a Test fragment with changes');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
