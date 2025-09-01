
import request from 'supertest';
import { createApp } from '../src/app';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/db';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Server as SocketIOServer } from "socket.io";

let mongo: MongoMemoryServer;
let app: any;
let io: SocketIOServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await connectToDatabase(mongoUri);

  // Mock Socket.IO server for testing
  io = new SocketIOServer();
  app = createApp();
  app.set("socketio", io);
});

afterAll(async () => {
  await disconnectFromDatabase();
  await mongo.stop();
  io.close();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual('test@example.com');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should not register a user with existing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});
