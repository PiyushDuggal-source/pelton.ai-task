# Frontend (React + Vite + TypeScript)

This directory contains the React.js/Vite/TypeScript frontend for the Collaborative Project Tracker.

## Technologies Used

- React
- Vite
- TypeScript
- React Router DOM for routing
- React Hook Form with Zod for form validation
- Axios for API calls
- Tailwind CSS for styling
- `@dnd-kit` for drag-and-drop
- Socket.IO Client for real-time communication
- `react-datepicker` for date inputs

## Features Implemented

- **Authentication:** User registration and login pages with form validation.
- **Dashboard:**
  - List projects the user belongs to.
  - Create new projects.
  - Join projects via invite code.
- **Project Detail Page:**
  - Display project header (title, description, members, invite code).
  - Task list with filtering by status.
  - CRUD operations for tasks (create, update, delete) using a modal form.
  - Change task status (To Do, In Progress, Done).
  - Kanban board view for tasks with drag-and-drop functionality.
  - Comments thread per task with real-time updates.
  - Attachments section for tasks (upload and delete).
- **Real-time Updates:** Live updates for tasks, comments, and attachments using Socket.IO.

## Setup and Running

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation
Navigate to this directory and install dependencies:
```bash
npm install
```

### Environment Variables
Create a `.env` file in this directory with the following content:

```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### Running the Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Type-check and build the application for production.
- `npm run lint`: Run ESLint for code linting.
- `npm run preview`: Preview the production build locally.