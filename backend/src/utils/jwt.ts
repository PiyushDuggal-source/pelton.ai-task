import jwt from "jsonwebtoken";

export type JwtPayload = { userId: string };

const accessSecret = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";

export function signAccessToken(
  payload: JwtPayload,
  expiresIn: string = "15m"
) {
  return jwt.sign(payload, accessSecret, { expiresIn });
}

export function signRefreshToken(
  payload: JwtPayload,
  expiresIn: string = "7d"
) {
  return jwt.sign(payload, refreshSecret, { expiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}
