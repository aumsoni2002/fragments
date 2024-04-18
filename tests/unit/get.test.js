// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');
const fs = require('fs');
const path = require('path');

const deleteUserData = async (user) => {
  const userHash = hash(user);
  const userFragments = await Fragment.byUser(userHash);
  if (userFragments.length > 0) {
    for (const fragmentId of userFragments) {
      await Fragment.delete(userHash, fragmentId);
    }
  }
};

describe('Fragment Retrieval Tests', () => {
  afterEach(async () => {
    await deleteUserData('user1@email.com');
  });

  test('Unauthorized Access is Rejected', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('Invalid Credentials are Rejected', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('invalid@email.com', 'invalidPassword');
    expect(res.statusCode).toBe(401);
  });

  test('Authenticated Users Retrieve Fragments Array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.statusCode).toBe(200);
  });

  test('All User Fragment IDs are Retrieved in an Array', async () => {
    const id1 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment 1')
    ).body.fragment.id;

    const id2 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment 2')
    ).body.fragment.id;

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    const resFragments = res.body.fragments;

    expect(resFragments[0]).toBe(id1);
    expect(resFragments[1]).toBe(id2);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  test('Empty Array Returned for User with No Fragments', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    const resFragment = res.body.fragments;

    expect(resFragment.length).toBe(0);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(resFragment)).toBe(true);
  });
});

describe('Fragment with Metadata Retrieval Tests', () => {
  afterEach(async () => {
    await deleteUserData('user1@email.com');
  });

  test('should retrieve fragments with full metadata when expand query param is set', async () => {
    const id1 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment1')
    ).body.fragment.id;

    const id2 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment2')
    ).body.fragment.id;

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    const resFragments = res.body.fragments;

    expect(resFragments[0].id).toBe(id1);
    expect(resFragments[1].id).toBe(id2);
    expect(res.statusCode).toBe(200);
  });

  test('If the user does not have any fragments, an empty array is returned', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.body.fragments.length).toBe(0);
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});

describe('Fragment with Raw Data by Id Retrieval Tests', () => {
  afterEach(async () => {
    await deleteUserData('user1@email.com');
  });

  test('Unauthorized Access is Rejected', async () => {
    const res = await request(app).get('/v1/fragments/id');
    expect(res.statusCode).toBe(401);
  });

  test('Invalid Credentials are Rejected', async () => {
    const res = await request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'invalidPassword');
    expect(res.statusCode).toBe(401);
  });

  test('Error returned when requesting a non-existent fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/no-such-id')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('Retrieve data for an existing fragment upon request', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${createdFragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res.text).toBe('This is a fragment');
    expect(res.status).toBe(200);
  });
});

describe('Fragment with Meta Data by Id Retrieval Tests', () => {
  afterEach(async () => {
    await deleteUserData('user1@email.com');
  });

  test('Retrieve data for an existing fragment', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment1');

    const postedFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${postedFragmentId}/info`)
      .auth('user1@email.com', 'password1');

    const resFragment = res.body.fragment;

    expect(res.status).toBe(200);
    expect(typeof resFragment).toBe('object');
    expect(resFragment.id).toEqual(postedFragmentId);
  });

  test('Error is thrown when requesting a fragment that does not exist', async () => {
    const res = await request(app)
      .get(`/v1/fragments/non-existent/info`)
      .auth('user1@email.com', 'password1');

    expect(res.body.error.message).toBeDefined;
    expect(res.body.error.code).toBe(404);
    expect(res.status).toBe(404);
  });
});

describe('Converting fragments from one extension to other extension', () => {
  afterEach(async () => {
    await deleteUserData('user1@email.com');
  });

  test('Unmatched fragment conversion should result in an error', async () => {
    const data = '# some markdown data';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send(data);

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${createdFragmentId}.gif`)
      .auth('user1@email.com', 'password1');

    expect(res.body.error.message).toBeDefined;
    expect(res.body.error.code).toBe(415);
    expect(res.status).toBe(415);
  });

  test('Checking Conversion from txt to txt', async () => {
    const data = 'Hello, I am a text data.';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(res.text).toBe('Hello, I am a text data.');
    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('text/plain');
  });

  test('Checking Conversion from md to md', async () => {
    const data = '# some markdown data';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.md`)
      .auth('user1@email.com', 'password1');

    expect(res.get('Content-Type')).toContain('text/markdown');
    expect(res.text).toBe('# some markdown data');
    expect(res.status).toBe(200);
  });

  test('Checking Conversion from md to html', async () => {
    const data = '# some markdown data';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.get('Content-Type')).toContain('text/html');
    expect(res.text).toBe('<h1>some markdown data</h1>\n');
    expect(res.status).toBe(200);
  });

  test('Checking Conversion from md to txt', async () => {
    const data = '# some markdown data';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.text).toBe('SOME MARKDOWN DATA');
    expect(res.get('Content-Type')).toContain('text/plain');
  });

  test('Checking Conversion from json to json', async () => {
    const data = {
      content: 'Hello, I am a JSON data.',
    };

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/json')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.json`)
      .auth('user1@email.com', 'password1');

    expect(res.get('Content-Type')).toContain('application/json');
    expect(res.body).toEqual({ content: 'Hello, I am a JSON data.' });
    expect(res.status).toBe(200);
  });

  test('Checking Conversion from json to txt', async () => {
    const data = {
      content: 'Hello, I am a JSON data.',
    };

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/json')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(res.get('Content-Type')).toContain('text/plain');
    expect(res.status).toBe(200);
    expect(res.text).toBe('{"content":"Hello, I am a JSON data."}');
  });

  test('Checking Conversion from png to png', async () => {
    const imagePath = path.join(__dirname, '../../images', 'png_image.png');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/png')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/png');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from png to jpeg', async () => {
    const imagePath = path.join(__dirname, '../../images', 'png_image.png');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/png')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.jpg`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/jpeg');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from png to webp', async () => {
    const imagePath = path.join(__dirname, '../../images', 'png_image.png');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/png')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/webp');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  // test('Checking Conversion from png => gif', async () => {
  //   const imagePath = path.join(__dirname, '../../images', 'png_image.png');
  //   const data = fs.readFileSync(imagePath);

  //   const postResponse = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .set('content-type', 'image/png')
  //     .send(data);

  //   const res = await request(app)
  //     .get(`/v1/fragments/${postResponse.body.fragment.id}.gif`)
  //     .auth('user1@email.com', 'password1');

  //   expect(res.status).toBe(200);
  //   expect(res.get('Content-Type')).toContain('image/gif');
  //   expect(Buffer.isBuffer(res.body)).toBe(true);
  // }, 20000);

  test('Checking Conversion from jpg to jpg', async () => {
    const imagePath = path.join(__dirname, '../../images', 'jpg_image.jpg');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/jpeg')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.jpg`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/jpeg');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from jpg to png', async () => {
    const imagePath = path.join(__dirname, '../../images', 'jpg_image.jpg');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/jpeg')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/png');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from jpg to webp', async () => {
    const imagePath = path.join(__dirname, '../../images', 'jpg_image.jpg');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/jpeg')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/webp');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  // test('Checking Conversion from jpg => gif', async () => {
  //   const imagePath = path.join(__dirname, '../../images', 'jpg_image.jpg');
  //   const data = fs.readFileSync(imagePath);

  //   const postResponse = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .set('content-type', 'image/jpeg')
  //     .send(data);

  //   const res = await request(app)
  //     .get(`/v1/fragments/${postResponse.body.fragment.id}.gif`)
  //     .auth('user1@email.com', 'password1');

  //   expect(res.status).toBe(200);
  //   expect(res.get('Content-Type')).toContain('image/gif');
  //   expect(Buffer.isBuffer(res.body)).toBe(true);
  // });

  test('Checking Conversion from webp to webp', async () => {
    const imagePath = path.join(__dirname, '../../images', 'webp_image.webp');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/webp')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/webp');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from webp to png', async () => {
    const imagePath = path.join(__dirname, '../../images', 'webp_image.webp');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/webp')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/png');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from webp to jpg', async () => {
    const imagePath = path.join(__dirname, '../../images', 'webp_image.webp');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/webp')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.jpg`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/jpeg');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  // test('Checking Conversion from webp => gif', async () => {
  //   const imagePath = path.join(__dirname, '../../images', 'webp_image.webp');
  //   const data = fs.readFileSync(imagePath);

  //   const postResponse = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .set('content-type', 'image/webp')
  //     .send(data);

  //   const res = await request(app)
  //     .get(`/v1/fragments/${postResponse.body.fragment.id}.gif`)
  //     .auth('user1@email.com', 'password1');

  //   expect(res.status).toBe(200);
  //   expect(res.get('Content-Type')).toContain('image/gif');
  //   expect(Buffer.isBuffer(res.body)).toBe(true);
  // });

  test('Checking Conversion from gif to gif', async () => {
    const imagePath = path.join(__dirname, '../../images', 'gif_image.gif');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/gif')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.gif`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/gif');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from gif to png', async () => {
    const imagePath = path.join(__dirname, '../../images', 'gif_image.gif');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/gif')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/png');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from gif to jpg', async () => {
    const imagePath = path.join(__dirname, '../../images', 'gif_image.gif');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/gif')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.jpg`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/jpeg');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  test('Checking Conversion from gif to webp', async () => {
    const imagePath = path.join(__dirname, '../../images', 'gif_image.gif');
    const imageData = fs.readFileSync(imagePath);

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'image/gif')
      .send(imageData);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('image/webp');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });
});
