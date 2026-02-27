// ClaudeScan — Static File Server for Render
// This serves the built React app

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ClaudeScan running on port ${PORT}`);
  console.log(`Contract: zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH`);
});
