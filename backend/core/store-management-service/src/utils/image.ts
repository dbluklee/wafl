import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';

export const imageUtils = {
  async processMenuImage(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const outputPath = path.join(config.upload.dir, 'menus', filename);

    // 이미지 리사이징 및 최적화
    await sharp(file.buffer)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return `/uploads/menus/${filename}`;
  },

  async deleteImage(imagePath: string): Promise<void> {
    if (!imagePath) return;

    const fullPath = path.join(config.upload.dir, imagePath.replace('/uploads/', ''));

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
};