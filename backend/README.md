# Backend (Express + TypeScript)

This directory contains the Node.js/Express/TypeScript backend for the Collaborative Project Tracker.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose ORM)
- Socket.IO for real-time communication
- JWT for authentication
- Zod for validation
- Helmet, `express-rate-limit`, `express-mongo-sanitize` for security

## Features Implemented

- **Authentication & Authorization:** User registration, login, JWT-based access/refresh tokens, role-based middleware.
- **Project Management:** CRUD operations for projects, joining projects via invite code.
- **Task Management:** CRUD operations for tasks, filtering, status updates.
- **Collaboration:** Commenting on tasks, attaching files to tasks.
- **Real-time Updates:** Live updates for tasks, comments, and attachments via Socket.IO.

## Environment Variables

Create a `.env` file in this directory with the following content:

```
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development # or production
```

- `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/your_db_name`).
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Random strong strings for JWT signing.
- `FRONTEND_URL`: The URL of your frontend application.

## Scripts

- `npm install`: Install backend dependencies.
- `npm run dev`: Start the development server with `tsx watch`.
- `npm run build`: Compile TypeScript to `dist/`.
- `npm start`: Run the compiled server from `dist/server.js`.
- `npm test`: Run Jest tests.

## Testing

Unit and integration tests are set up using Jest and Supertest. Database interactions are mocked using `mongodb-memory-server`.

To run tests:
```bash
npm test
```