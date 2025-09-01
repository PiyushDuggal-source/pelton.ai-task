
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { requireProjectMember } from "../middleware/roles";
import { AttachmentModel, AttachmentDocument } from "../models/Attachment";
import { TaskModel } from "../models/Task";
import { ProjectModel } from "../models/Project";
import multer from "multer";
import { createSocketEmitter } from "../ws/emitter";

const router = Router();

router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage() });

const createAttachmentSchema = z.object({
  taskId: z.string(),
});

const getAttachmentsSchema = z.object({
  taskId: z.string(),
});

// Helper function to get attachments by task ID
const getAttachmentsByTaskId = async (
  taskId: string
): Promise<AttachmentDocument[]> => {
  return AttachmentModel.find({ taskId }).sort({ createdAt: -1 }).lean();
};

// Helper function to create an attachment
const createAttachment = async (
  uploadedBy: string,
  data: {
    taskId: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }
): Promise<AttachmentDocument> => {
  const attachment = await AttachmentModel.create({ ...data, uploadedBy });
  return attachment;
};

// Helper function to delete an attachment
const deleteAttachment = async (
  userId: string,
  attachmentId: string
): Promise<AttachmentDocument | null> => {
  const attachment = await AttachmentModel.findById(attachmentId);
  if (!attachment) {
    return null;
  }

  const task = await TaskModel.findById(attachment.taskId.toString());
  if (!task) {
    return null;
  }

  const project = await ProjectModel.findById(task.projectId.toString());
  if (!project) {
    return null;
  }

  const isOwner = project.ownerId.toString() === userId;
  const isUploader = attachment.uploadedBy.toString() === userId;

  if (!isOwner && !isUploader) {
    throw new Error("You are not authorized to delete this attachment");
  }

  return AttachmentModel.findByIdAndDelete(attachmentId);
};

router.get(
  "/:taskId/attachments",
  requireProjectMember,
  async (req, res) => {
    const parsed = getAttachmentsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const attachments = await getAttachmentsByTaskId(parsed.data.taskId);
    return res.json({ attachments });
  }
);

router.post(
  "/:taskId/attachments",
  requireProjectMember,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const parsed = createAttachmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { originalname, size, mimetype, buffer } = req.file;

    // In a real application, you would upload the buffer to a cloud storage
    // provider (e.g., S3, Cloudinary) and get a URL.
    // For this example, we'll just use a placeholder URL.
    const url = `https://example.com/uploads/${originalname}`;

    const created = await createAttachment(req.user!.userId, {
      ...parsed.data,
      url,
      filename: originalname,
      size,
      mimeType: mimetype,
    });

    const emitter = createSocketEmitter(req.io);
    const task = await TaskModel.findById(created.taskId.toString());
    if (task) {
      emitter.emitAttachmentAdd(task.projectId.toString(), created);
    }

    return res.status(201).json({ attachment: created });
  }
);

router.delete(
  "/attachments/:attachmentId",
  async (req, res) => {
    try {
      const deleted = await deleteAttachment(
        req.user!.userId,
        req.params.attachmentId
      );
      if (!deleted) return res.status(404).json({ error: "Not found" });
      const emitter = createSocketEmitter(req.io);
      // We need the projectId to emit the event to the correct room
      // This requires fetching the task and then the project
      const attachment = await AttachmentModel.findById(req.params.attachmentId);
      if (attachment) {
        const task = await TaskModel.findById(attachment.taskId.toString());
        if (task) {
          emitter.emitAttachmentRemove(task.projectId.toString(), deleted._id.toString());
        }
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }
);

export default router;
