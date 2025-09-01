import { Router } from "express";
import authRouter from "./auth";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import commentsRouter from "./comments";
import attachmentsRouter from "./attachments";
import usersRouter from "./users";

const router = Router();

router.get("/ping", (_req, res) => {
  res.status(200).json({ message: "pong" });
});

router.use("/auth", authRouter);
router.use("/projects", projectsRouter);
router.use("/tasks", tasksRouter);
router.use("/tasks", commentsRouter);
router.use("/tasks", attachmentsRouter);
router.use("/users", usersRouter);

export default router;