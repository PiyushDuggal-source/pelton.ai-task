import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { requireAuth } from "../middleware/requireAuth";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, password } = parsed.data;
  const existing = await UserModel.findOne({ email }).lean();
  if (existing)
    return res.status(409).json({ error: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await UserModel.create({ name, email, passwordHash });
  const accessToken = signAccessToken({ userId: String(created._id) });
  const refreshToken = signRefreshToken({ userId: String(created._id) });
  return res
    .status(201)
    .json({
      user: { id: created._id, name, email },
      accessToken,
      refreshToken,
    });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const accessToken = signAccessToken({ userId: String(user._id) });
  const refreshToken = signRefreshToken({ userId: String(user._id) });
  return res.json({
    user: { id: user._id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  });
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

router.post("/refresh", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const accessToken = signAccessToken({ userId: payload.userId });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", async (_req, res) => {
  // Token revocation list or rotation can be implemented later
  return res.status(200).json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user!.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

export default router;
