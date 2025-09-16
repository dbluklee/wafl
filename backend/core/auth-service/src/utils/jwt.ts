import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IJwtPayload } from '../types';
import { refreshTokenStore } from '../config/memory-store';

export const jwtUtils = {
  generateAccessToken(payload: IJwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    } as jwt.SignOptions);
  },

  generateRefreshToken(payload: IJwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn
    } as jwt.SignOptions);
  },

  async generateTokenPair(payload: IJwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token in Redis
    await refreshTokenStore.set(
      payload.userId,
      refreshToken,
      30 * 24 * 60 * 60 // 30 days in seconds
    );

    return { accessToken, refreshToken };
  },

  verifyToken(token: string): IJwtPayload {
    return jwt.verify(token, config.jwt.secret) as IJwtPayload;
  },

  async verifyRefreshToken(token: string, userId: string): Promise<boolean> {
    try {
      const decoded = this.verifyToken(token);
      if (decoded.userId !== userId) return false;

      const storedToken = await refreshTokenStore.get(userId);
      return storedToken === token;
    } catch {
      return false;
    }
  }
};