import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

import healthHandler from "./api/health";
import generateIdeasHandler from "./api/gemini/generate-ideas";
import reminderEmailHandler from "./api/gemini/reminder-email";
import chatbotHandler from "./api/gemini/chatbot";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Mount API endpoints
  app.get("/api/health", healthHandler);
  app.post("/api/gemini/generate-ideas", generateIdeasHandler);
  app.post("/api/gemini/reminder-email", reminderEmailHandler);
  app.post("/api/gemini/chatbot", chatbotHandler);

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
