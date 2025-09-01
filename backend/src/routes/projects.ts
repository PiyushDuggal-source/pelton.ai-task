import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { requireProjectOwner, requireProjectMember } from "../middleware/roles";
import { ProjectModel } from "../models/Project";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = req.user!.userId;
  const projects = await ProjectModel.find({
    $or: [{ ownerId: userId }, { memberIds: userId }],
  })
    .sort({ updatedAt: -1 })
    .lean();
  return res.json({ projects });
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  deadline: z.string().datetime().optional().nullable(),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description, deadline } = parsed.data;
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const created = await ProjectModel.create({
    name,
    description,
    deadline: deadline ? new Date(deadline) : undefined,
    ownerId: req.user!.userId,
    memberIds: [],
    inviteCode,
  });
  return res.status(201).json({ project: created });
});

router.get("/:projectId", requireProjectMember, async (req, res) => {
  const project = await ProjectModel.findById(req.params.projectId).lean();
  if (!project) return res.status(404).json({ error: "Not found" });
  return res.json({ project });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  deadline: z.string().datetime().optional().nullable(),
});

router.patch("/:projectId", requireProjectOwner, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { name, description, deadline } = parsed.data;
  const updated = await ProjectModel.findByIdAndUpdate(
    req.params.projectId,
    {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(deadline !== undefined
        ? { deadline: deadline ? new Date(deadline) : null }
        : {}),
    },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json({ project: updated });
});

router.delete("/:projectId", requireProjectOwner, async (req, res) => {
  const deleted = await ProjectModel.findByIdAndDelete(req.params.projectId);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

const joinSchema = z.object({ inviteCode: z.string().min(4) });

router.post("/join", async (req, res) => {
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const userId = req.user!.userId;
  const project = await ProjectModel.findOne({
    inviteCode: parsed.data.inviteCode,
  });
  if (!project) return res.status(404).json({ error: "Invalid invite code" });
  if (
    String(project.ownerId) === userId ||
    project.memberIds.some((m) => String(m) === userId)
  ) {
    return res.json({ project });
  }
  project.memberIds.push(userId as any);
  await project.save();
  return res.json({ project });
});

export default router;
