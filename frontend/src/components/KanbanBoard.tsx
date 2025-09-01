import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { type Task, type User } from "../types/api";

// Props for the main board
interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onTaskMove: (
    taskId: string,
    newStatus: Task["status"],
    newOrder: "low" | "medium" | "high",
  ) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

// --- Task Item Component ---
interface TaskItemProps {
  task: Task;
  users: User[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  users,
  onTaskEdit,
  onTaskDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const assignee = users.find((user) => user._id === task.assigneeId);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <button
          onClick={() => onTaskEdit(task)}
          className="text-xs p-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Edit
        </button>
        <button
          onClick={() => onTaskDelete(task._id)}
          className="text-xs p-1 rounded bg-red-200 hover:bg-red-300"
        >
          Delete
        </button>
      </div>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white p-3 rounded-md shadow-sm mb-3 cursor-grab relative"
      >
        <h4 className="font-medium pr-16">{task.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        <div className="text-xs text-gray-500 mt-2 space-y-1">
          {task.dueDate && (
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
          )}
          <p>
            Priority:{" "}
            <span
              className={`font-semibold ${
                task.priority === "high"
                  ? "text-red-500"
                  : task.priority === "medium"
                    ? "text-yellow-500"
                    : "text-green-500"
              }`}
            >
              {task.priority}
            </span>
          </p>
          {assignee && <p>Assignee: {assignee.name}</p>}
        </div>
      </div>
    </div>
  );
};

// --- Kanban Column Component ---
interface KanbanColumnProps {
  id: Task["status"];
  title: string;
  tasks: Task[];
  users: User[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  users,
  onTaskEdit,
  onTaskDelete,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? "#f0f0f0" : "#f9fafb", // Highlight when dragging over
    transition: "background-color 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg shadow-md w-full md:w-1/3 flex-shrink-0"
    >
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="min-h-[100px]">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            users={users}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
          />
        ))}
      </div>
    </div>
  );
};

// --- Main Kanban Board Component ---
const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMove,
  users,
  onTaskEdit,
  onTaskDelete,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columns: Record<Task["status"], Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeTask = tasks.find((t) => t._id === active.id);
      const overColumnId = over.id as Task["status"];

      if (activeTask && activeTask.status !== overColumnId) {
        onTaskMove(activeTask._id, overColumnId, "low"); // order is hardcoded
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <KanbanColumn
          id="todo"
          title="To Do"
          tasks={columns.todo}
          users={users}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
        />
        <KanbanColumn
          id="in_progress"
          title="In Progress"
          tasks={columns.in_progress}
          users={users}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
        />
        <KanbanColumn
          id="done"
          title="Done"
          tasks={columns.done}
          users={users}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskItem
            task={activeTask}
            users={users}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
