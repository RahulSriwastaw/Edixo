# Backend Integration Guide - Chunked PDF Upload Support

## 📋 Overview

The new Flutter whiteboard PDF export system uses advanced chunked upload for large files. This guide shows you how to implement the required backend endpoints.

---

## 🔧 Required Backend Endpoints

### 1. Direct File Upload (For files < 1MB)

**Endpoint:**
```
POST /whiteboard/sets/{setId}/whiteboard-pdf
Content-Type: multipart/form-data
```

**Request:**
```
multipart/form-data:
  - file: <PDF binary data>
  - totalPages: "10"
  - fileSize: "2.50"
```

**Response (Success):**
```json
{
  "statusCode": 201,
  "data": {
    "fileUrl": "uploads/whiteboard/class_notes_set_001_1234567890.pdf",
    "fileName": "class_notes_set_001_1234567890.pdf",
    "fileSize": 2621440,
    "totalPages": 10
  }
}
```

**Response (Error):**
```json
{
  "statusCode": 400,
  "error": "Invalid PDF file"
}
```

---

### 2. Chunked Upload - Upload Chunk

**Endpoint:**
```
POST /whiteboard/sets/{setId}/upload-chunk
Content-Type: multipart/form-data
```

**Request:**
```
multipart/form-data:
  - uploadId: "1712720000000_12345"
  - chunkIndex: "0"
  - totalChunks: "51"
  - chunk: <1MB binary data>
```

**Response (Success):**
```json
{
  "statusCode": 200,
  "data": {
    "uploadId": "1712720000000_12345",
    "chunkIndex": 0,
    "totalChunks": 51,
    "received": true,
    "checksum": "abc123def456"
  }
}
```

**Response (Already Received):**
```json
{
  "statusCode": 200,
  "data": {
    "uploadId": "1712720000000_12345",
    "chunkIndex": 0,
    "alreadyReceived": true
  }
}
```

---

### 3. Chunked Upload - Finalize

**Endpoint:**
```
POST /whiteboard/sets/{setId}/finalize-upload
Content-Type: application/json
```

**Request:**
```json
{
  "uploadId": "1712720000000_12345",
  "fileName": "class_notes_set_001_1712720000000.pdf",
  "totalPages": 127,
  "totalSize": 52428800
}
```

**Response (Success):**
```json
{
  "statusCode": 201,
  "data": {
    "uploadId": "1712720000000_12345",
    "fileUrl": "uploads/whiteboard/class_notes_set_001_1712720000000.pdf",
    "fileName": "class_notes_set_001_1712720000000.pdf",
    "fileSize": 52428800,
    "totalPages": 127,
    "mergedAt": "2026-04-10T14:30:45.123Z"
  }
}
```

---

## 🛠️ Implementation Examples

### Node.js / Express Implementation

```javascript
// routes/whiteboard.routes.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure uploads directory
const UPLOAD_DIR = path.join(__dirname, '../uploads/whiteboard');
const CHUNK_DIR = path.join(UPLOAD_DIR, 'temp_chunks');

// Ensure directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(CHUNK_DIR)) fs.mkdirSync(CHUNK_DIR, { recursive: true });

// Configure multer
const upload = multer({ dest: CHUNK_DIR });

// ==================== DIRECT UPLOAD ====================
router.post('/sets/:setId/whiteboard-pdf', upload.single('file'), async (req, res) => {
  try {
    const { setId } = req.params;
    const { totalPages, fileSize } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        statusCode: 400, 
        error: 'No file uploaded' 
      });
    }
    
    // Validate PDF
    if (!req.file.mimetype.includes('pdf')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        statusCode: 400, 
        error: 'Invalid file type. PDF required.' 
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `class_notes_${setId}_${timestamp}.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Move file from temp to uploads
    fs.renameSync(req.file.path, filePath);
    
    // Optional: Save metadata to database
    // await WhiteboardPDF.create({
    //   setId,
    //   fileName,
    //   filePath: `uploads/whiteboard/${fileName}`,
    //   fileSize: req.file.size,
    //   totalPages: parseInt(totalPages),
    //   uploadedAt: new Date(),
    // });
    
    res.status(201).json({
      statusCode: 201,
      data: {
        fileUrl: `uploads/whiteboard/${fileName}`,
        fileName,
        fileSize: req.file.size,
        totalPages: parseInt(totalPages),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      statusCode: 500, 
      error: 'Upload failed' 
    });
  }
});

// ==================== CHUNKED UPLOAD - STEP 1 ====================
router.post('/sets/:setId/upload-chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { setId } = req.params;
    const { uploadId, chunkIndex, totalChunks } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        statusCode: 400, 
        error: 'No chunk data' 
      });
    }
    
    // Create directory for this upload
    const uploadChunkDir = path.join(CHUNK_DIR, uploadId);
    if (!fs.existsSync(uploadChunkDir)) {
      fs.mkdirSync(uploadChunkDir, { recursive: true });
    }
    
    // Save chunk with index
    const chunkPath = path.join(uploadChunkDir, `chunk_${chunkIndex}`);
    fs.renameSync(req.file.path, chunkPath);
    
    // Create metadata file if first chunk
    const metadataPath = path.join(uploadChunkDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      fs.writeFileSync(metadataPath, JSON.stringify({
        uploadId,
        totalChunks: parseInt(totalChunks),
        setId,
        startedAt: new Date(),
        chunks: {},
      }));
    }
    
    // Update metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    metadata.chunks[chunkIndex] = {
      received: true,
      size: req.file.size,
      receivedAt: new Date(),
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
    
    res.status(200).json({
      statusCode: 200,
      data: {
        uploadId,
        chunkIndex: parseInt(chunkIndex),
        totalChunks: parseInt(totalChunks),
        received: true,
      },
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({ 
      statusCode: 500, 
      error: 'Chunk upload failed' 
    });
  }
});

// ==================== CHUNKED UPLOAD - STEP 2 (FINALIZE) ====================
router.post('/sets/:setId/finalize-upload', async (req, res) => {
  let uploadChunkDir;
  try {
    const { setId } = req.params;
    const { uploadId, fileName, totalPages, totalSize } = req.body;
    
    uploadChunkDir = path.join(CHUNK_DIR, uploadId);
    const metadataPath = path.join(uploadChunkDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(400).json({ 
        statusCode: 400, 
        error: 'Upload session not found' 
      });
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const receivedChunks = Object.keys(metadata.chunks).length;
    
    // Verify all chunks received
    if (receivedChunks !== metadata.totalChunks) {
      return res.status(400).json({ 
        statusCode: 400, 
        error: `Missing chunks. Received: ${receivedChunks}, Expected: ${metadata.totalChunks}` 
      });
    }
    
    // Merge chunks into final PDF
    const timestamp = Date.now();
    const finalFileName = `class_notes_${setId}_${timestamp}.pdf`;
    const finalFilePath = path.join(UPLOAD_DIR, finalFileName);
    
    const writeStream = fs.createWriteStream(finalFilePath);
    
    // Write chunks in order
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkPath = path.join(uploadChunkDir, `chunk_${i}`);
      if (!fs.existsSync(chunkPath)) {
        throw new Error(`Missing chunk ${i}`);
      }
      
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Verify file size
    const stats = fs.statSync(finalFilePath);
    if (stats.size.toString() !== totalSize.toString()) {
      fs.unlinkSync(finalFilePath);
      throw new Error('File size mismatch after merge');
    }
    
    // Optional: Save to database
    // await WhiteboardPDF.create({
    //   setId,
    //   fileName: finalFileName,
    //   filePath: `uploads/whiteboard/${finalFileName}`,
    //   fileSize: stats.size,
    //   totalPages: parseInt(totalPages),
    //   uploadedAt: new Date(),
    // });
    
    // Cleanup temp chunks
    fs.rmSync(uploadChunkDir, { recursive: true });
    
    res.status(201).json({
      statusCode: 201,
      data: {
        uploadId,
        fileUrl: `uploads/whiteboard/${finalFileName}`,
        fileName: finalFileName,
        fileSize: stats.size,
        totalPages: parseInt(totalPages),
        mergedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Finalize error:', error);
    
    // Cleanup on error
    if (uploadChunkDir && fs.existsSync(uploadChunkDir)) {
      fs.rmSync(uploadChunkDir, { recursive: true });
    }
    
    res.status(500).json({ 
      statusCode: 500, 
      error: 'Finalization failed: ' + error.message 
    });
  }
});

module.exports = router;
```

---

## 🔍 Database Schema (Optional)

### WhiteboardPDF Table

```sql
CREATE TABLE whiteboard_pdfs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  set_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  total_pages INT NOT NULL,
  upload_id VARCHAR(255) UNIQUE,
  upload_status ENUM('pending', 'complete', 'failed') DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (set_id) REFERENCES question_sets(set_id) ON DELETE CASCADE,
  INDEX idx_set_id (set_id),
  INDEX idx_upload_id (upload_id),
  INDEX idx_uploaded_at (uploaded_at)
);
```

---

## 🧹 Cleanup Task (Recommended)

Implement a scheduled task to clean up abandoned uploads:

```javascript
// scripts/cleanup-abandoned-uploads.js

const fs = require('fs');
const path = require('path');

function cleanupAbandonedUploads() {
  const CHUNK_DIR = path.join(__dirname, '../uploads/whiteboard/temp_chunks');
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  
  try {
    const uploads = fs.readdirSync(CHUNK_DIR);
    
    for (const uploadId of uploads) {
      const uploadPath = path.join(CHUNK_DIR, uploadId);
      const stats = fs.statSync(uploadPath);
      const age = now - stats.mtimeMs;
      
      if (age > MAX_AGE) {
        console.log(`Removing abandoned upload: ${uploadId}`);
        fs.rmSync(uploadPath, { recursive: true });
      }
    }
    
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run every 6 hours
setInterval(cleanupAbandonedUploads, 6 * 60 * 60 * 1000);
```

---

## 🧪 Testing

### Test with cURL

```bash
# 1. Direct upload (small file)
curl -X POST http://localhost:4000/api/whiteboard/sets/set_001/whiteboard-pdf \
  -F "file=@test.pdf" \
  -F "totalPages=10" \
  -F "fileSize=2.50"

# 2. Chunked upload - send chunk
curl -X POST http://localhost:4000/api/whiteboard/sets/set_001/upload-chunk \
  -F "uploadId=1712720000000_12345" \
  -F "chunkIndex=0" \
  -F "totalChunks=51" \
  -F "chunk=@chunk_0.bin"

# 3. Finalize upload
curl -X POST http://localhost:4000/api/whiteboard/sets/set_001/finalize-upload \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "1712720000000_12345",
    "fileName": "class_notes_set_001.pdf",
    "totalPages": 127,
    "totalSize": 52428800
  }'
```

---

## 📊 Performance Considerations

### Recommended Configuration

```javascript
// .env or config.js
UPLOAD_MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max
CHUNK_SIZE = 1024 * 1024;                  // 1MB chunks
CHUNK_TIMEOUT = 24 * 60 * 60;              // 24 hours
CONCURRENT_CHUNKS = 10;                    // Allow 10 concurrent chunks
```

### Scaling Tips

1. **Disk Space:** Plan for 2-3x of actual file size (temp chunks + final file)
2. **Network:** Chunked upload works better on poor connections
3. **Concurrency:** Increase `maxConnections` for better parallelism
4. **Monitoring:** Track upload stats for optimization

---

## 🔒 Security Considerations

```javascript
// Add security middleware

// 1. Validate file size
app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (contentLength > 500 * 1024 * 1024) {
    return res.status(413).json({ error: 'File too large' });
  }
  next();
});

// 2. Validate file type
const validMimeTypes = ['application/pdf'];
app.post('/whiteboard/sets/:setId/whiteboard-pdf', (req, res, next) => {
  if (!validMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  next();
});

// 3. Authenticate requests
app.use(authenticate); // Your auth middleware

// 4. Validate setId ownership
app.post('/whiteboard/sets/:setId/*', async (req, res, next) => {
  const { setId } = req.params;
  const set = await QuestionSet.findById(setId);
  if (set.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
});
```

---

## ✅ Verification Checklist

- [ ] All three endpoints implemented
- [ ] Chunk directory created automatically
- [ ] Metadata tracking working
- [ ] File merge assembles chunks correctly
- [ ] File size validation working
- [ ] Error handling covers edge cases
- [ ] Cleanup task removing old uploads
- [ ] Security considerations implemented
- [ ] Database schema updated (optional)
- [ ] Tested with real file uploads

---

**Reference:** Flutter client at `lib/features/whiteboard/services/advanced_pdf_upload_service.dart`

*Last Updated: April 10, 2026*
