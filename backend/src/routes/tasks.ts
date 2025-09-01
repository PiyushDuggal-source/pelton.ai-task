import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { requireProjectMember } from "../middleware/roles";
import { TaskModel, TaskDocument } from "../models/Task";
import { createSocketEmitter } from "../ws/emitter";

const router = Router();

router.use(requireAuth);

const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]),
});

const getTasksSchema = z.object({
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

// Helper function to get tasks
const getTasks = async (
  projectId: string,
  filter: z.infer<typeof getTasksSchema>,
): Promise<TaskDocument[]> => {
  return TaskModel.find({ projectId, ...filter })
    .sort({ order: 1 })
    .lean();
};

// Helper function to get a task by ID
const getTaskById = async (taskId: string): Promise<TaskDocument | null> => {
  return TaskModel.findById(taskId).lean();
};

// Helper function to create a task
const createTask = async (
  data: z.infer<typeof createTaskSchema>,
): Promise<TaskDocument> => {
  const task = await TaskModel.create({
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  });
  return task;
};

// Helper function to update a task
const updateTask = async (
  taskId: string,
  data: z.infer<typeof updateTaskSchema>,
): Promise<TaskDocument | null> => {
  return TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...data,
      ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
    },
    { new: true },
  );
};

// Helper function to delete a task
const deleteTask = async (taskId: string): Promise<TaskDocument | null> => {
  return TaskModel.findByIdAndDelete(taskId);
};

router.get(
  "/project/:projectId/tasks",
  requireProjectMember,
  async (req, res) => {
    const parsed = getTasksSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const tasks = await getTasks(req.params.projectId, parsed.data);
    return res.json({ tasks });
  },
);

router.post(
  "/project/:projectId/tasks",
  requireProjectMember,
  async (req, res) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });

    const created = await createTask(parsed.data);
    const emitter = createSocketEmitter(req.io);
    emitter.emitTaskCreate(created.projectId.toString(), created);
    return res.status(201).json({ task: created });
  },
);

router.get("/:taskId", async (req, res) => {
  const task = await getTaskById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "Not found" });
  return res.json({ task });
});

router.patch("/:taskId", async (req, res) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await updateTask(req.params.taskId, parsed.data);
  if (!updated) return res.status(404).json({ error: "Not found" });
  const emitter = createSocketEmitter(req.io);
  emitter.emitTaskUpdate(updated.projectId.toString(), updated);
  return res.json({ task: updated });
});

router.patch("/:taskId/status", async (req, res) => {
  const parsed = updateTaskStatusSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await updateTask(req.params.taskId, parsed.data);
  if (!updated) return res.status(404).json({ error: "Not found" });
  const emitter = createSocketEmitter(req.io);
  emitter.emitTaskStatusUpdate(
    updated.projectId.toString(),
    updated._id.toString(),
    updated.status,
  );
  return res.json({ task: updated });
});

router.delete("/:taskId", async (req, res) => {
  const deleted = await deleteTask(req.params.taskId);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  const emitter = createSocketEmitter(req.io);
  emitter.emitTaskDelete(deleted.projectId.toString(), deleted._id.toString());
  return res.status(204).send();
});

export default router;
