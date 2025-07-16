// utils/uploadImage.js

const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const stream = require('stream');
const uploadFileToGridFS = (file,tenantDb) => {
    return new Promise((resolve, reject) => {
      const bucket = new GridFSBucket(tenantDb, { bucketName: 'uploads' });
      
      // Store metadata (optional but useful)
      const metadata = {
        uploadedAt: new Date(),
        originalName: file.originalname,
        mimetype: file.mimetype,
      };
  
      const uploadStream = bucket.openUploadStream(file.originalname, { metadata });
  
      uploadStream.on('error', (err) => {
        console.error('GridFS upload error:', err);
        reject({ error: 'File upload failed', details: err.message });
      });
  
      uploadStream.on('finish', () => {
        // Get the file ID from the uploadStream (not the callback param)
        const fileId = uploadStream.id;
        resolve({
          message: 'File uploaded successfully',
          file: { _id: fileId }, // Explicitly return the ID
        });
      });
  
      // Pipe the file buffer into GridFS
      const readableStream = new stream.PassThrough();
      readableStream.end(file.buffer);
      readableStream.pipe(uploadStream);
    });
  };

module.exports = uploadFileToGridFS;