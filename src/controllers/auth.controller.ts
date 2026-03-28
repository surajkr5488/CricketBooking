import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/authenticate';

const registerSchema = z.object({
  name:     z.string().min(2, 'Name too short'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.registerUser(data);
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data          = loginSchema.parse(req.body);
    const { tokens, user } = await authService.loginUser(data);
    res.json({ ...tokens, user });
  } catch (err) { next(err); }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logoutUser(req.userId!);
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ error: 'refreshToken required' }); return; }
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUser(req.userId!);
    res.json({ user });
  } catch (err) { next(err); }
}
