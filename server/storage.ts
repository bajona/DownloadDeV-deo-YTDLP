import { downloads, type Download, type InsertDownload } from "@shared/schema";

export interface IStorage {
  createDownload(download: InsertDownload): Promise<Download>;
  getDownload(id: number): Promise<Download | undefined>;
  updateDownload(id: number, updates: Partial<Download>): Promise<Download | undefined>;
  deleteDownload(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private downloads: Map<number, Download>;
  private currentId: number;

  constructor() {
    this.downloads = new Map();
    this.currentId = 1;
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = this.currentId++;
    const download: Download = {
      ...insertDownload,
      id,
      status: 'pending',
      progress: 0,
      filename: null,
      errorMessage: null,
      createdAt: new Date(),
    };
    this.downloads.set(id, download);
    return download;
  }

  async getDownload(id: number): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async updateDownload(id: number, updates: Partial<Download>): Promise<Download | undefined> {
    const existing = this.downloads.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.downloads.set(id, updated);
    return updated;
  }

  async deleteDownload(id: number): Promise<boolean> {
    const existed = this.downloads.has(id);
    this.downloads.delete(id);
    return existed;
  }
}

export const storage = new MemStorage();
