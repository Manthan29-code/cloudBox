// routes/fileRoutes.js
const express = require('express')
const router = express.Router()

const { uploadFile, getFilesByFolder, getFileById, updateFileMetadata, deleteFile, getUserFileStats } = require('../controllers/file.controlllers')
const { upload } = require('../middleware/multer.middleware')
const {verifyJWT} = require('../middleware/auth.middleware')

router.use(verifyJWT)
router.post('/upload' , upload.single('file'), uploadFile)

router.get('/byFolder/:folderId', getFilesByFolder)
router.get('/stats', getUserFileStats)

router.route('/:id')
    .get(getFileById)
    .patch(updateFileMetadata)
    .delete(deleteFile)



module.exports = router