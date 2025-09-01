import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { type Project, type Task, type User } from "../types/api";
import {
  getTasks,
  type GetTasksFilterInput,
  createTask,
  type CreateTaskInput,
  updateTask,
  type UpdateTaskInput,
  deleteTask,
  updateTaskStatus,
} from "../features/tasks/tasks";
import { getUsers } from "../features/users/users";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm";
import KanbanBoard from "../components/KanbanBoard";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetTasksFilterInput>({});
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const fetchProjectAndTasks = async () => {
    try {
      const projectResponse = await axios.get(
        `${API_BASE_URL}/projects/${projectId}`,
        {
          headers: getAuthHeader(),
        },
      );
      setProject(projectResponse.data.project);

      const tasksData = await getTasks(projectId!, filters);
      setTasks(tasksData);

      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectAndTasks();

      const socket: any = io(SOCKET_URL, {
        auth: { token: localStorage.getItem("accessToken") },
      });

      socket.on("connected", (payload: { ok: boolean }) => {
        console.log("Socket connected:", payload);
        socket.emit("project:join", { projectId: projectId! });
      });

      socket.on("task:create", (payload: { task: Task }) => {
        if (payload.task.projectId === projectId) {
          setTasks((prev) => [...prev, payload.task]);
        }
      });

      socket.on("task:update", (payload: { task: Task }) => {
        if (payload.task.projectId === projectId) {
          setTasks((prev) =>
            prev.map((task) =>
              task._id === payload.task._id ? payload.task : task,
            ),
          );
        }
      });

      socket.on("task:delete", (payload: { taskId: string }) => {
        setTasks((prev) => prev.filter((task) => task._id !== payload.taskId));
      });

      socket.on(
        "task:status",
        (payload: { taskId: string; status: string }) => {
          setTasks((prev) =>
            prev.map((task) =>
              task._id === payload.taskId
                ? { ...task, status: payload.status }
                : task,
            ),
          );
        },
      );

      socket.on("attachment:add", (payload: { attachment: any }) => {
        // You might want to update the task to show the new attachment count or list
        console.log("Attachment added:", payload.attachment);
      });

      socket.on("attachment:remove", (payload: { attachmentId: string }) => {
        // You might want to update the task to show the new attachment count or list
        console.log("Attachment removed:", payload.attachmentId);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [projectId, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value === "" ? undefined : e.target.value,
    });
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const previousTasks = tasks;
      setTasks((prev) => prev.filter((task) => task._id !== taskId)); // Optimistic update
      try {
        await deleteTask(taskId);
        toast.success("Task deleted successfully!");
      } catch (err: any) {
        setTasks(previousTasks); // Rollback
        toast.error(err.response?.data?.error || "Failed to delete task");
      }
    }
  };

  const handleTaskFormSubmit = async (
    data: CreateTaskInput | UpdateTaskInput,
  ) => {
    const previousTasks = tasks;
    console.log("data", data);
    try {
      if (editingTask) {
        const updatedTask = await updateTask(
          editingTask._id,
          data as UpdateTaskInput,
        );
        setTasks((prev) =>
          prev.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        );
        toast.success("Task updated successfully!");
      } else {
        // For creation, we don't have an _id yet, so we'll add a temporary one
        const tempId = `temp-${Date.now()}`;
        const newTask = {
          ...data,
          _id: tempId,
          projectId: projectId!,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: data.status || "todo",
          priority: data.priority || "medium",
          order: 0,
        } as Task;
        setTasks((prev) => [...prev, newTask]);
        const createdTask = await createTask(data as CreateTaskInput);
        setTasks((prev) =>
          prev.map((task) => (task._id === tempId ? createdTask : task)),
        );
        toast.success("Task created successfully!");
      }
      setIsTaskModalOpen(false);
      setEditingTask(undefined);
    } catch (err: any) {
      setTasks(previousTasks); // Rollback
      toast.error(err.response?.data?.error || "Failed to save task");
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)),
      );
      toast.success("Task status updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update task status");
    }
  };

  const handleTaskMove = async (
    taskId: string,
    newStatus: Task["status"],
    newOrder: "low" | "medium" | "high",
  ) => {
    try {
      const updatedTask = await updateTask(taskId, {
        status: newStatus,
        priority: newOrder,
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)),
      );
      toast.success(`Task moved to ${newStatus} successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to move task");
    }
  };

  const handleCopyInviteCode = () => {
    if (project) {
      navigator.clipboard.writeText(project.inviteCode);
      toast.success("Invite code copied to clipboard!");
    }
  };

  if (loading)
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow mb-6 animate-pulse h-48"></div>
        <div className="bg-white p-6 rounded-lg shadow animate-pulse h-96"></div>
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  if (!project)
    return <div className="text-center py-10">Project not found.</div>;

  const owner = users.find((user) => user._id === project.ownerId);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-700 mb-2">{project.description}</p>
        {project.deadline && (
          <p className="text-gray-500 text-sm">
            Deadline: {new Date(project.deadline).toLocaleDateString()}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Owner: {owner?.name || project.ownerId}
        </p>
        <p className="text-gray-500 text-sm flex items-center">
          Invite Code:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded mx-2">
            {project.inviteCode}
          </span>
          <button
            onClick={handleCopyInviteCode}
            className="text-sm p-1 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Copy
          </button>
        </p>
        <p className="text-gray-500 text-sm">
          Members: {project.memberIds.length + 1}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <button
          onClick={handleCreateTask}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Task
        </button>
        <div className="mb-4 flex space-x-4">
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status-filter"
              name="status"
              onChange={handleFilterChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">All</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          {/* Add assignee filter here if user data is available */}
        </div>
        <KanbanBoard
          tasks={tasks}
          onTaskMove={handleTaskMove}
          users={users}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
        />
      </div>

      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          projectId={projectId!}
          task={editingTask}
          onSubmit={handleTaskFormSubmit}
          onCancel={() => setIsTaskModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;
