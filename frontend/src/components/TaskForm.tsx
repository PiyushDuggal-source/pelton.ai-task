import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, type CreateTaskInput, updateTaskSchema, type UpdateTaskInput } from "../features/tasks/tasks";
import { type Task, type User } from "../types/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getUsers } from "../features/users/users";

interface TaskFormProps {
  projectId: string;
  task?: Task; // Optional, for editing existing tasks
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, task, onSubmit, onCancel }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err: any) {
        setUsersError(err.response?.data?.error || "Failed to fetch users");
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const schema = task ? updateTaskSchema : createTaskSchema;
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateTaskInput | UpdateTaskInput>({
    resolver: zodResolver(schema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    } : {
      projectId: projectId,
      status: "todo",
      priority: "medium",
    },
  });

  const dueDateWatch = watch("dueDate");

  const handleFormSubmit = (data: CreateTaskInput | UpdateTaskInput) => {
    onSubmit(data);
  };

  if (usersLoading) return <div className="text-center py-4">Loading users...</div>;
  if (usersError) return <div className="text-center py-4 text-red-600">Error: {usersError}</div>;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
          {...register("description")}
        ></textarea>
      </div>
      <div>
        <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">Assignee</label>
        <select
          id="assigneeId"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
          {...register("assigneeId")}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
          {...register("status")}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
          {...register("priority")}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
        <DatePicker
          selected={dueDateWatch ? new Date(dueDateWatch) : null}
          onChange={(date: Date | null) => setValue("dueDate", date ? date.toISOString() : null)}
          showTimeSelect
          dateFormat="Pp"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;