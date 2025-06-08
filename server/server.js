const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const https = require('https');
const http = require('http');


const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000
const HTTPS_PORT = process.env.HTTPS_PORT
const path_private_key = process.env.PRIVATE_KEY
const path_certificate = process.env.CERTIFICATE
const file_pattern = process.env.DB_FILE_PATTERN

const is_cert_file_exist = (fs.existsSync(path_private_key) && fs.existsSync(path_certificate))

let privateKey
let certificate
let credentials
let httpsServer
let regexPattern

app.use(cors());

// Define the path to your backups folder

// const backupsFolder = path.join(__dirname, 'backups');
const backupsFolder = process.env.BACKUP_FOLDER;

if (file_pattern) {
    // Remove leading/trailing quotes and slashes if they exist
    const cleanedPattern = file_pattern.replace(/^\/|"|\/$/g, '');
    regexPattern = new RegExp(cleanedPattern);
} else {
    console.warn("DB_FILE_PATTERN not found in .env file.");
    // Handle this case, perhaps by setting a default pattern or throwing an error
    regexPattern = /^db_([^_]+)/; // Default or fallback
}

if(is_cert_file_exist){
  privateKey = fs.readFileSync(`${path_private_key}`, 'utf8');
  certificate = fs.readFileSync(`${path_certificate}`, 'utf8')
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
        const dbNameMatch = file.name.match(regexPattern);
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

// API endpoint to download a specific file (for the download buttons)
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

if(is_cert_file_exist){
  try{
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
    });
  }catch(e){
    console.log(e)
  }
}




app.listen(HTTP_PORT, () => {
  console.log(`Server listening at http://localhost:${HTTP_PORT}`);
  console.log(`Ensure your backup folder exists at: ${path.resolve(backupsFolder)}`);
  console.log('To run: node server.js');
});
