// routes/fileRoutes.js
const express = require('express')
const router = express.Router()
// const {
//     uploadFile,
//     getFilesByFolder,
//     getFileById,
//     updateFileMetadata,
//     deleteFile,
//     moveFile,
//     getAllUserFiles,
//     getUserFileStats
// } = require('../controllers/fileController')
const { uploadFile, getFilesByFolder, getFileById, updateFileMetadata, deleteFile } = require('../controllers/file.controlllers')
const { upload } = require('../middleware/multer.middleware')
const {verifyJWT} = require('../middleware/auth.middleware')

router.use(verifyJWT)
router.post('/upload' , upload.single('file'), uploadFile)


// router.get('/user/all', getAllUserFiles)
// router.get('/user/stats', getUserFileStats)

router.get('/byFolder/:folderId', getFilesByFolder)

router.route('/:id')
    .get(getFileById)
    .patch(updateFileMetadata)
    .delete(deleteFile)



module.exports = router