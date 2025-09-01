# Collaborative Project Tracker (MERN, TypeScript)

Collaborative project tracker built with MERN (MongoDB, Express.js, React, Node.js) and TypeScript.

Click on the image below to watch the **video**:
[![Watch the video](https://github.com/PiyushDuggal-source/pelton.ai-task/blob/main/thumbnail.png?raw=true)](https://drive.google.com/file/d/1dek6yDiqnlp0Jr2TR9Hx6yq1eRL4QFtg/view?usp=sharing)

## Technologies Used

**Backend:**

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose ORM)
- Socket.IO
- JWT for authentication
- Zod for validation
- Helmet, express-rate-limit, express-mongo-sanitize for security

**Frontend:**

- React
- Vite
- TypeScript
- React Router DOM for routing
- React Hook Form with Zod for form validation
- Axios for API calls
- Tailwind CSS for styling
- @dnd-kit for drag-and-drop
- Socket.IO Client for real-time communication

## Features Implemented

**Authentication & Authorization:**

- User registration and login
- JWT-based authentication with access and refresh tokens
- Role-based access control (project owner/member)

**Project Management:**

- Create, view, update, and delete projects
- Join projects via invite code

**Task Management:**

- Create, view, update, and delete tasks within projects
- Filter tasks by assignee and status
- Update task status (To Do, In Progress, Done)
- Kanban board with drag-and-drop functionality for tasks

**Collaboration:**

- Add comments to tasks (real-time updates)
- Attachments to tasks (upload and delete)

**Real-time Updates:**

- Live updates for tasks, comments, and attachments using Socket.IO

## Setup and Running the Application

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (local instance or MongoDB Atlas connection string)

### 1. Clone the repository

```bash
git clone https://github.com/piyushduggal-source/pelton.ai-task
cd pelton.ai-task
```

### 2. Backend Setup

Navigate to the `backend` directory, install dependencies, and set up environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following content:

```
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
FRONTEND_URL=http://localhost:5173
```

Replace `your_mongodb_connection_string` with your MongoDB URI (e.g., `mongodb://localhost:27017/your_db_name` or your MongoDB Atlas connection string). You can generate random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

Start the backend server:

```bash
npm run dev
```

The backend server will run on `http://localhost:4000`.

### 3. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, install dependencies, and set up environment variables.

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory with the following content:

```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`.

## Project Structure

```
pelton.ai-task/
├── backend/                # Node.js/Express/TypeScript backend
│   ├── src/
│   │   ├── app.ts          # Express app setup, middleware
│   │   ├── config/         # Database connection
│   │   ├── middleware/     # Auth, roles, rate limiting, sanitization
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes (auth, projects, tasks, comments, attachments)
│   │   ├── utils/          # JWT utilities
│   │   └── ws/             # Socket.IO configuration and emitter
│   └── test/               # Backend tests
├── frontend/               # React/Vite/TypeScript frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images, icons
│   │   ├── components/     # Reusable UI components (Modal, TaskForm, CommentsSection, KanbanBoard)
│   │   ├── features/       # Feature-specific logic (auth, projects, tasks, comments)
│   │   ├── pages/          # Main application pages (Login, Register, Dashboard, ProjectDetail)
│   │   ├── types/          # TypeScript type definitions (API DTOs, Socket.IO events)
│   │   ├── App.tsx         # Main application component, routing
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   └── ...                 # Other Vite/React config files
└── README.md               # Project overview and setup instructions
```

## API Documentation

The API is served from the backend at `/api/v1`.

### Authentication

| Method | Endpoint         | Description                                      |
| ------ | ---------------- | ------------------------------------------------ |
| POST   | `/auth/register` | Register a new user.                             |
| POST   | `/auth/login`    | Login a user and receive access/refresh tokens.  |
| POST   | `/auth/refresh`  | Obtain a new access token using a refresh token. |
| POST   | `/auth/logout`   | Logout a user (future implementation).           |

### Projects

_Authentication required for all endpoints._

| Method | Endpoint               | Description                                 |
| ------ | ---------------------- | ------------------------------------------- |
| GET    | `/projects`            | Get all projects for the logged-in user.    |
| POST   | `/projects`            | Create a new project.                       |
| GET    | `/projects/:projectId` | Get a project by ID (must be a member).     |
| PATCH  | `/projects/:projectId` | Update a project by ID (must be the owner). |
| DELETE | `/projects/:projectId` | Delete a project by ID (must be the owner). |
| POST   | `/projects/join`       | Join a project using an invite code.        |

### Tasks

_Authentication and project membership required for all endpoints._

| Method | Endpoint                          | Description                                                       |
| ------ | --------------------------------- | ----------------------------------------------------------------- |
| GET    | `/tasks/project/:projectId/tasks` | Get all tasks for a project. Filter by `assigneeId` and `status`. |
| POST   | `/tasks/project/:projectId/tasks` | Create a new task in a project.                                   |
| GET    | `/tasks/:taskId`                  | Get a task by ID.                                                 |
| PATCH  | `/tasks/:taskId`                  | Update a task by ID.                                              |
| DELETE | `/tasks/:taskId`                  | Delete a task by ID (must be the owner).                          |
| PATCH  | `/tasks/:taskId/status`           | Update the status of a task.                                      |

### Comments

_Authentication and project membership required for all endpoints._

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/tasks/:taskId/comments` | Get all comments for a task.    |
| POST   | `/tasks/:taskId/comments` | Create a new comment on a task. |

### Attachments

_Authentication and project membership required for all endpoints._

| Method | Endpoint                           | Description                                                     |
| ------ | ---------------------------------- | --------------------------------------------------------------- |
| GET    | `/tasks/:taskId/attachments`       | Get all attachments for a task.                                 |
| POST   | `/tasks/:taskId/attachments`       | Upload a new attachment to a task (multipart/form-data).        |
| DELETE | `/tasks/attachments/:attachmentId` | Delete an attachment by ID (must be uploader or project owner). |

### Users

_Authentication required for all endpoints._

| Method | Endpoint | Description    |
| ------ | -------- | -------------- |
| GET    | `/users` | Get all users. |
