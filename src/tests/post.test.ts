/*const request = require('supertest');
import { token } from 'morgan';
import app from '../app';

describe('Posts API', () => {
  it('creates a post', async () => {
    const res = await request(app)
      .post('/api/v1/posts/public')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Hello world',
        visibility: 'PUBLIC'
      });

    expect(res.status).toBe(201);
  });
});