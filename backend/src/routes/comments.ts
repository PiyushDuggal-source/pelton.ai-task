
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { requireProjectMember } from "../middleware/roles";
import { CommentModel, CommentDocument } from "../models/Comment";
import { createSocketEmitter } from "../ws/emitter";
import { TaskModel } from "../models/Task";

const router = Router();

router.use(requireAuth);

const createCommentSchema = z.object({
  taskId: z.string(),
  body: z.string().min(1),
});

const getCommentsSchema = z.object({
  taskId: z.string(),
});

// Helper function to get comments by task ID
const getCommentsByTaskId = async (
  taskId: string
): Promise<CommentDocument[]> => {
  return CommentModel.find({ taskId }).sort({ createdAt: -1 }).lean();
};

// Helper function to create a comment
const createComment = async (
  authorId: string,
  data: z.infer<typeof createCommentSchema>
): Promise<CommentDocument> => {
  const comment = await CommentModel.create({ ...data, authorId });
  return comment;
};

router.get(
  "/:taskId/comments",
  requireProjectMember,
  async (req, res) => {
    const parsed = getCommentsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const comments = await getCommentsByTaskId(parsed.data.taskId);
    return res.json({ comments });
  }
);

router.post(
  "/:taskId/comments",
  requireProjectMember,
  async (req, res) => {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });

    const created = await createComment(req.user!.userId, parsed.data);
    const emitter = createSocketEmitter(req.io);
    const task = await TaskModel.findById(created.taskId.toString());
    if (task) {
      emitter.emitCommentCreate(task.projectId.toString(), created);
    }
    return res.status(201).json({ comment: created });
  }
);

export default router;
