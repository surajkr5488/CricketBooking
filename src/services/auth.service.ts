import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { createError } from '../middlewares/errorHandler';

// ── Token helpers ─────────────────────────────────────────────────
function signTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
}

// ── Register ──────────────────────────────────────────────────────
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw createError('Email already registered', 409);

  const hashed = await bcrypt.hash(data.password, 12);
  const user   = await prisma.user.create({
    data:   { name: data.name, email: data.email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return user;
}

// ── Login ─────────────────────────────────────────────────────────
export async function loginUser(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw createError('Invalid credentials', 401);

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw createError('Invalid credentials', 401);

  const tokens = signTokens(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data:  { refreshToken: tokens.refreshToken },
  });

  return {
    tokens,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

// ── Logout ────────────────────────────────────────────────────────
export async function logoutUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data:  { refreshToken: null },
  });
}

// ── Refresh ───────────────────────────────────────────────────────
export async function refreshAccessToken(refreshToken: string) {
  let payload: any;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw createError('Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== refreshToken)
    throw createError('Refresh token revoked', 401);

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
  return { accessToken };
}

// ── Get me ────────────────────────────────────────────────────────
export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) throw createError('User not found', 404);
  return user;
}
