import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDownloadSchema } from "@shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if yt-dlp is available
  app.get("/api/check-ytdlp", async (req, res) => {
    try {
      const ytdlp = spawn('python', ['-m', 'yt_dlp', '--version']);
      let responded = false;
      
      ytdlp.on('close', (code) => {
        if (!responded) {
          responded = true;
          if (code === 0) {
            res.json({ available: true });
          } else {
            res.json({ available: false });
          }
        }
      });
      
      ytdlp.on('error', () => {
        if (!responded) {
          responded = true;
          res.json({ available: false });
        }
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!responded) {
          responded = true;
          res.json({ available: false });
        }
      }, 5000);
    } catch (error) {
      res.json({ available: false });
    }
  });

  // Start download
  app.post("/api/downloads", async (req, res) => {
    try {
      const validatedData = insertDownloadSchema.parse(req.body);
      const download = await storage.createDownload(validatedData);
      
      // Start the download process
      startDownload(download.id, validatedData.url);
      
      res.json(download);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get download status
  app.get("/api/downloads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const download = await storage.getDownload(id);
      
      if (!download) {
        res.status(404).json({ message: "Download not found" });
        return;
      }
      
      res.json(download);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update download status
  app.patch("/api/downloads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updated = await storage.updateDownload(id, updates);
      
      if (!updated) {
        res.status(404).json({ message: "Download not found" });
        return;
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Download file
  app.get("/api/downloads/:id/file", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const download = await storage.getDownload(id);
      
      if (!download || download.status !== 'completed' || !download.filename) {
        res.status(404).json({ message: "File not found" });
        return;
      }
      
      const filePath = path.join(process.cwd(), 'downloads', download.filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: "File not found on disk" });
        return;
      }
      
      // Send file and delete after download
      res.download(filePath, download.filename, (err) => {
        if (!err) {
          // Delete file after successful download
          try {
            fs.unlinkSync(filePath);
            console.log('File deleted after download:', filePath);
          } catch (deleteError) {
            console.error('Error deleting file:', deleteError);
          }
          
          // Remove download record from storage
          storage.deleteDownload(download.id).catch(console.error);
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function startDownload(downloadId: number, url: string) {
  try {
    // Ensure downloads directory exists
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Clean up old files (older than 1 hour) to save space
    cleanupOldFiles(downloadsDir);

    await storage.updateDownload(downloadId, { status: 'downloading' });

    // Generate filename template
    const outputTemplate = path.join(downloadsDir, '%(title)s.%(ext)s');

    // Spawn yt-dlp process with better options for avoiding blocks
    const ytdlp = spawn('python', ['-m', 'yt_dlp',
      '-f', 'best[height<=720][ext=mp4]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '--no-check-certificates',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
      '--extractor-retries', '3',
      '--fragment-retries', '3',
      '--retry-sleep', '1',
      '--socket-timeout', '30',
      '--geo-bypass',
      '--newline',
      '-o', outputTemplate,
      url
    ]);

    let filename = '';

    ytdlp.stdout.on('data', async (data) => {
      const output = data.toString();
      console.log('yt-dlp output:', output);
      
      // Parse progress information
      const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
      if (progressMatch) {
        const progress = Math.round(parseFloat(progressMatch[1]));
        await storage.updateDownload(downloadId, { progress });
      }

      // Extract filename when available
      const filenameMatch = output.match(/\[download\] Destination: (.+)/);
      if (filenameMatch) {
        filename = path.basename(filenameMatch[1]);
      }
      
      // Also check for "has already been downloaded" messages
      const alreadyDownloadedMatch = output.match(/\[download\] (.+\.mp4) has already been downloaded/);
      if (alreadyDownloadedMatch) {
        filename = path.basename(alreadyDownloadedMatch[1]);
      }
    });

    ytdlp.stderr.on('data', (data) => {
      console.error('yt-dlp error:', data.toString());
    });

    ytdlp.on('close', async (code) => {
      if (code === 0) {
        // Try to find the actual filename if not captured
        if (!filename) {
          const downloadsDir = path.join(process.cwd(), 'downloads');
          const files = fs.readdirSync(downloadsDir).filter(f => f.endsWith('.mp4'));
          if (files.length > 0) {
            // Get the most recently modified file
            const mostRecent = files
              .map(f => ({ name: f, time: fs.statSync(path.join(downloadsDir, f)).mtime }))
              .sort((a, b) => b.time.getTime() - a.time.getTime())[0];
            filename = mostRecent.name;
          }
        }
        
        await storage.updateDownload(downloadId, {
          status: 'completed',
          progress: 100,
          filename: filename || 'download.mp4'
        });
      } else {
        await storage.updateDownload(downloadId, {
          status: 'error',
          errorMessage: 'Erro no download. Verifique se a URL é válida e se o yt-dlp está instalado.'
        });
      }
    });

    ytdlp.on('error', async (error) => {
      console.error('yt-dlp spawn error:', error);
      await storage.updateDownload(downloadId, {
        status: 'error',
        errorMessage: 'yt-dlp não encontrado. Consulte a aba de instalação.'
      });
    });

  } catch (error) {
    console.error('Download error:', error);
    await storage.updateDownload(downloadId, {
      status: 'error',
      errorMessage: 'Erro interno do servidor.'
    });
  }
}

// Clean up old files to prevent disk space issues
function cleanupOldFiles(downloadsDir: string) {
  try {
    const files = fs.readdirSync(downloadsDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour
    
    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        fs.unlinkSync(filePath);
        console.log('Cleaned up old file:', file);
      }
    });
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}
