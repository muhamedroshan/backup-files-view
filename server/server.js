const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const port = 3001;
const HTTP_PORT = 3001;
const HTTPS_PORT = 3001;


app.use(cors());

// Define the path to your backups folder

// const backupsFolder = path.join(__dirname, 'backups');
const backupsFolder = "/opt/odoo_backups";

const privateKey = fs.readFileSync('/root/key.pem', 'utf8');
const certificate = fs.readFileSync('/root/cert.pem', 'utf8')

const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

// Create the backups folder if it doesn't exist (optional, for testing)
if (!fs.existsSync(backupsFolder)) {
  fs.mkdirSync(backupsFolder);
  console.log(`Created backup folder at: ${backupsFolder}`);
}

// API endpoint to list backup files
app.get('/api/backups', async (req, res) => {
  try {
    // Read directory contents (files and subdirectories)
    // { withFileTypes: true } gives Dirent objects with isFile(), isDirectory() methods
    const files = await fs.promises.readdir(backupsFolder, { withFileTypes: true });

    const backupData = [];
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.zip')) { // Filter for .zip files
        const filePath = path.join(backupsFolder, file.name);
        const stats = await fs.promises.stat(filePath); // Get file stats (like creation time)

        // Extract database name from filename
        const dbNameMatch = file.name.match(/^db_([^_]+)/);
        const databaseName = dbNameMatch ? dbNameMatch[1] : 'unknown';

        backupData.push({
          filename: file.name,
          databaseName: databaseName,
          created: stats.mtime.toISOString(), // Use mtime (modified time) as created time
        });
      }
    }

    // Sort backups by creation date, most recent first (optional)
    backupData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    res.json(backupData); // Send the list of backup data as JSON
  } catch (error) {
    console.error('Error reading backups folder:', error);
    if (error.code === 'ENOENT') { // Folder not found
      res.status(404).json({ error: `Backup folder not found: ${backupsFolder}` });
    } else {
      res.status(500).json({ error: 'Failed to retrieve backup list' });
    }
  }
});

// Optional: API endpoint to download a specific file (for the download buttons)
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(backupsFolder, filename);

  // Check if file exists and prevent directory traversal
  if (fs.existsSync(filePath) && path.resolve(filePath).startsWith(backupsFolder)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Could not download the file.');
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
});

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server running on port ${HTTP_PORT} (redirecting to HTTPS)`);
});


// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
//   console.log(`Ensure your backup folder exists at: ${path.resolve(backupsFolder)}`);
//   console.log('To run: node server.js');
// });