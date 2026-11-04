import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);

// Serve static assets from root with clean directory index support
app.use(
  express.static(__dirname, {
    extensions: ['html'],
    index: ['index.html'],
  })
);

// Fallback to 404.html for unknown routes
app.use((req, res) => {
  res.status(404).sendFile(resolve(__dirname, '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GoGo Company & Shared Account server listening on http://0.0.0.0:${PORT}`);
});
