const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

describe('Testing POST /v1/fragments endpoint', () => {
  test('Should deny unauthenticated requests', async () => {
    const response = await request(app).post('/v1/fragments');

    expect(response.statusCode).toBe(401);
  });

  test('Should reject incorrect credentials', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password');

    expect(response.statusCode).toBe(401);
  });

  test('Authenticated users can create plain text fragments', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(response.statusCode).toBe(201);
  });

  test('Requests with invalid media types should throw an error', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'invalid')
      .send('This is a fragment');

    expect(response.statusCode).toBe(500);
    expect(response.body.error.message).toBe('invalid media type');
  });

  test('Requests with unsupported media types should return an error', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'media/jpeg')
      .send('This is a fragment');

    expect(response.status).toBe(415);
    // Check if the response body contains an error object
    expect(response.body.error).toBeDefined();
    expect(response.body.error.status).toBe('error');
  });

  test('Successful response should include status and a fragment object', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(response.body.status).toBe('ok');
    expect(response.body.fragment).toBeDefined();
  });

  test('Successful response fragment object should include all necessary properties', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(response.body.fragment.ownerId).toBe(hash('user1@email.com'));
    expect(response.body.fragment.created).toBeDefined();
    expect(response.body.fragment.updated).toBeDefined();
    expect(response.body.fragment.size).toEqual('This is a fragment'.length);
    expect(response.body.fragment.type).toBe('text/plain');
    expect(response.body.fragment.id).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
  });

  test('Response header should have the correct properties', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(response.status).toEqual(201);
    expect(response.get('content-type')).toBe('application/json; charset=utf-8');
    expect(typeof response.get('content-length')).toBe('string');
    expect(response.get('Location')).toBe(`${process.env.API_URL}/v1/fragments/${response.body.fragment.id}`);
  });
});
