const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskControllers');
const { authorize } = require('../Middleware/authMiddleware');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { getFromCache, setToCache} = require('../redisUtils');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.get('/report-data',authorize([2, 3, 4, 5]),taskController.getTaskReportData)

router.post('/import',authorize([1, 2, 3, 4, 5]),taskController.importICal)
router.post('/',authorize([3, 4, 5]), taskController.createTask);
router.get('/', authorize([1, 2, 3, 4, 5]),taskController.getTasksByOrganization);
router.get('/:id', authorize([2,3, 4, 5]),taskController.getTaskById);
router.put('/:id',upload.array('images', 5),authorize([2, 3, 4, 5]),taskController.updateTask);
router.delete('/:id',authorize([3, 4, 5]), taskController.deleteTask);
router.patch('/:id/status', authorize([2,3, 4, 5]),taskController.changeTaskStatus);
router.post('/filter', authorize([ 2, 3, 4, 5]), taskController.filterTasksByOrganization);
router.get('/done/all', authorize([2, 3, 4, 5]), taskController.getAllDoneTasks);
router.get('/done/user', authorize([2, 3, 4, 5]), taskController.getDoneTasksForUser);
router.get('/assigned/user', authorize([2, 3, 4, 5]), taskController.getTasksByAssignedUser);
// Cache TTL for image metadata (1 day)
const IMAGE_META_TTL = 86400;
// Single image route with Redis caching
router.get('/image/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const cacheKey = `image:meta:${fileId}`;
    const db = req.tenantDB;
    // Try to get metadata from cache first
    const cachedMeta = await getFromCache(cacheKey);
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    if (cachedMeta) {
      console.log(`[Cache] Serving image metadata from cache for ${fileId}`);
      res.set('Content-Type', cachedMeta.contentType || 'image/jpeg');
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      return downloadStream.pipe(res);
    }

    // No cache hit, fetch from database
    const file = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).next();
    if (!file) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Cache the metadata (not the image data itself)
    const metaData = {
      contentType: file.contentType,
      filename: file.filename,
      uploadDate: file.uploadDate,
      length: file.length
    };
    await setToCache(cacheKey, metaData, IMAGE_META_TTL);
    console.log(`[Cache] Cached metadata for image ${fileId}`);

    res.set('Content-Type', file.contentType || 'image/jpeg');
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ success: false, message: "Failed to fetch image" });
  }
});
// Bulk images metadata route with Redis caching
router.get('/images/bulk', async (req, res) => {
  try {
    const { fileIds } = req.query;
    const ids = fileIds.split(',').map(id => new mongoose.Types.ObjectId(id));
    const cacheKey = `images:bulk:${fileIds.replace(/,/g, ':')}`;
    const db = req.tenantDB;
    // Try cache first
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`[Cache] Serving bulk images metadata from cache`);
      return res.status(200).json({
        success: true,
        data: cachedResult,
        fromCache: true
      });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const files = await bucket.find({ _id: { $in: ids } }).toArray();

    const result = files.map(file => ({
      fileId: file._id,
      contentType: file.contentType,
      filename: file.filename,
      uploadDate: file.uploadDate,
      length: file.length
    }));

    // Cache the bulk metadata
    await setToCache(cacheKey, result, IMAGE_META_TTL);
    console.log(`[Cache] Cached bulk metadata for ${fileIds}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching bulk images:", error);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
});
module.exports = router;