import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API routes
  app.get("/api/auth/url", (req, res) => {
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: process.env.GITLAB_CLIENT_ID || 'placeholder_client_id',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'api read_user',
    });

    const authUrl = `https://gitlab.com/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.post("/api/publish/gitlab", async (req, res) => {
    const { content, title } = req.body;
    
    // In a real app, we would use the stored access token for the user
    // For this demo, we'll simulate a successful publish to GitLab Snippets or Issues
    console.log(`Publishing to GitLab: ${title} - ${content}`);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If we had a real token, we'd do something like:
    /*
    const response = await fetch('https://gitlab.com/api/v4/snippets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title,
        content,
        visibility: 'public',
        file_name: 'promotion.md'
      })
    });
    */

    res.json({ success: true, message: "Published to GitLab successfully!" });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    
    // In a real production app, you would exchange the code for an access token:
    /*
    const response = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITLAB_CLIENT_ID,
        client_secret: process.env.GITLAB_SECRET_KEY,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.APP_URL}/auth/callback`
      })
    });
    const tokens = await response.json();
    */
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: 'GitLab' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
