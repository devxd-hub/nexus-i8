import path from 'path';
import fs from 'fs';

export interface IStorageService {
  saveFile(filename: string, buffer: Buffer, mimeType: string): Promise<string>;
  deleteFile(filePath: string): Promise<boolean>;
  getUrl(filename: string): string;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;
  private publicPrefix: string;

  constructor(uploadDir: string = 'public/uploads', publicPrefix: string = '/uploads') {
    this.uploadDir = path.resolve(process.cwd(), uploadDir);
    this.publicPrefix = publicPrefix;

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async saveFile(filename: string, buffer: Buffer): Promise<string> {
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const targetPath = path.join(this.uploadDir, safeName);
    await fs.promises.writeFile(targetPath, buffer);
    return `${this.publicPrefix}/${safeName}`;
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    const filename = path.basename(filePath);
    const targetPath = path.join(this.uploadDir, filename);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return true;
    }
    return false;
  }

  public getUrl(filename: string): string {
    return `${this.publicPrefix}/${filename}`;
  }
}

export const storageService = new LocalStorageService();
