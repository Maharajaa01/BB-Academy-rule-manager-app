import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- PROXY TO FRAPPE BACKEND ---
  app.all('/api/*', async (req, res) => {
    try {
      const frappeUrl = process.env.VITE_FRAPPE_URL || "http://127.0.0.1:8000";
      const url = `${frappeUrl}${req.originalUrl}`;
      
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (key !== 'host' && key !== 'content-length' && value !== undefined) {
          headers.append(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }
      
      const token = process.env.VITE_FRAPPE_TOKEN || 'token 5f88b922f020e04:53aadae6d700df9';
      headers.set('Authorization', token);
      headers.set('Content-Type', 'application/json');

      const response = await fetch(url, {
        method: req.method,
        headers: headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        let data = await response.json();
        // Unwrap Frappe's message wrapper so the frontend sees `{status: 'success', data: ...}` directly
        if (data && data.message && typeof data.message === 'object' && data.message.status) {
          data = data.message;
        }
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (err) {
      console.error('Proxy error:', err);
      res.status(500).json({ status: 'error', message: 'Proxy error to Frappe Backend' });
    }
  });

    // --- FRONTEND INTEGRATION & ASSETS ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BB Rule Manager server running at http://localhost:${PORT}`);
  });
}

startServer();
