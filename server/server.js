const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();
const HTTP_PORT = int(process.env.HTTP_PORT);
const HTTPS_PORT = int(process.env.HTTP_PORT);
const privateKeyPath = process.env.PRIVATE_KEY
const certificatePath = process.env.CERTIFICATE

const isFileExist = (fs.existsSync(privateKeyPath) && fs.existsSync(certificatePath))

let privateKey;
let certificate;
let credentials;
let httpsServer;


app.use(cors());


const backupsFolder = process.env.BACKUP_FOLDER;

if(isFileExist){
  privateKey = fs.readFileSync(`${privateKeyPath}`, 'utf8');
  certificate = fs.readFileSync(`${certificatePath}`, 'utf8')
  credentials = { key: privateKey, cert: certificate };
  httpsServer = https.createServer(credentials, app);
}

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
        const databaseName = dbNameMatch ? "db_"+dbNameMatch[1] : 'unknown';

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

try{
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
  });
}catch(e){
  console.warn(`HTTPS not enabled: Missing private key or certificate files. Error: ${error.message}`);
  console.log('Falling back to HTTP only...');
}


app.listen(HTTP_PORT, () => {
  console.log(`Server listening at http://localhost:${HTTP_PORT}`);
  console.log(`Ensure your backup folder exists at: ${path.resolve(backupsFolder)}`);
  console.log('To run: node server.js');
});