const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

router.get('/', downloadController.getAllDownloads);
router.post('/', downloadController.createDownloadJob);
router.post('/pauseAll', downloadController.pauseAllDownloads);
router.post('/resumeAll', downloadController.resumeAllDownloads);
router.post('/cancelAll', downloadController.cancelAllDownloads);
router.post('/:id/pause', downloadController.pauseDownload);
router.post('/:id/resume', downloadController.resumeDownload);
router.post('/:id/cancel', downloadController.cancelDownload);

module.exports = router;
