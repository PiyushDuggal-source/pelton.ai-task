import { NextFunction, Request, Response } from "express";
import { ProjectModel } from "../models/Project";
import { TaskModel } from "../models/Task";

export async function requireProjectMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.userId;
  let projectId = req.params.projectId || req.body.projectId;

  if (!projectId && req.params.taskId) {
    const task = await TaskModel.findById(req.params.taskId).lean();
    if (task) {
      projectId = task.projectId.toString();
    }
  }

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!projectId) return res.status(400).json({ error: "Missing projectId" });
  const project = await ProjectModel.findById(projectId).lean();
  if (!project) return res.status(404).json({ error: "Project not found" });
  const isMember =
    String(project.ownerId) === userId ||
    (project.memberIds || []).some((m) => String(m) === userId);
  if (!isMember) return res.status(403).json({ error: "Forbidden" });
  return next();
}

export async function requireProjectOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.userId;
  let projectId = req.params.projectId || req.body.projectId;

  if (!projectId && req.params.taskId) {
    const task = await TaskModel.findById(req.params.taskId).lean();
    if (task) {
      projectId = task.projectId.toString();
    }
  }

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!projectId) return res.status(400).json({ error: "Missing projectId" });
  const project = await ProjectModel.findById(projectId).lean();
  if (!project) return res.status(404).json({ error: "Project not found" });
  const isOwner = String(project.ownerId) === userId;
  if (!isOwner) return res.status(403).json({ error: "Owner only" });
  return next();
}
