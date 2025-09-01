
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { UserModel } from "../models/User";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  // In a real application, you would fetch users based on some criteria
  // e.g., users in the same organization, or project members.
  // For now, we return all users (excluding sensitive info).
  const users = await UserModel.find({}).select("-passwordHash -refreshToken");
  return res.json({ users });
});

export default router;
