const File = require('../models/files.model')
const asyncHandler = require("../middleware/asyncHandler")
const mongoose = require("mongoose")
const Folder = require('../models/folder.model')
const { uploadToCloudinary, deleteFileFromCloudinary } = require('../utils/cloudinary.utils')


const uploadFile = asyncHandler(async (req, res) => {
    const { folderId, isPublic } = req.body
    const userId = req.user._id
    console.log("inside upload file ", req.body )
    if (!req.file) {
        const error = new Error("No file uploaded")
        error.statusCode = 400
        throw error
    }

    if (folderId) {
        if (!mongoose.Types.ObjectId.isValid(folderId)) {
            const error = new Error("Invalid folder ID")
            error.statusCode = 400
            throw error
        }

        const folder = await Folder.findById(folderId)
        // you can only create file inside folder 
        //TODO : file at root level is currently not allowed
        if (!folder) {
            const error = new Error("Folder not found")
            error.statusCode = 404
            throw error
        }

        if (folder.owner.toString() !== userId.toString()) {
            const error = new Error("You don't have permission to upload to this folder")
            error.statusCode = 403
            throw error
        }
    }

    const cloudinaryFolder = `user_${userId}/files`

    const uploadResult = await uploadToCloudinary(req.file.path, cloudinaryFolder)

    if (!uploadResult) {
        const error = new Error("Failed to upload file to Cloudinary")
        error.statusCode = 500
        throw error
    }
    console.log(" fom cloudinary ", uploadResult)
    console.log(" public id ", uploadResult.public_id)
    const file = await File.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        cloudUrl: uploadResult.secure_url,
        folderId: folderId || null,
        mimeType: req.file.mimetype,
        size: req.file.size,
        isPublic: isPublic === 'true' || isPublic === true,
        metadata: {
            publicId: uploadResult.public_id, // we need it to delete file from cloudinary
            uploadedAt: new Date(),
            encoding: req.file.encoding
        },
        owner: userId
    })

    const populatedFile = await File.findById(file._id)
        .populate('owner', 'username email')
        .populate('folderId', 'name')

    return res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        file: populatedFile
    })
})

const getFilesByFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params
    const userId = req.user._id

    if (!folderId) {
        const error = new Error("Folder ID is required")
        error.statusCode = 400
        throw error
    }

    if (!mongoose.Types.ObjectId.isValid(folderId)) {
        const error = new Error("Invalid folder ID")
        error.statusCode = 400
        throw error
    }

    const folder = await Folder.findById(folderId)

    if (!folder) {
        const error = new Error("Folder not found")
        error.statusCode = 404
        throw error
    }

    if (folder.owner.toString() !== userId.toString() && !folder.isPublic) {
        const error = new Error("You don't have permission to access this folder")
        error.statusCode = 403
        throw error
    }

    const files = await File.find({ folderId })
        .populate('owner', 'username email')
        .populate('folderId', 'name')
        .sort({ createdAt: -1 })

    return res.status(200).json({
        success: true,
        count: files.length,
        files
    })
})

const getFileById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid file ID")
        error.statusCode = 400
        throw error
    }

    const file = await File.findById(id)
        .populate('owner', 'username email')
        .populate('folderId', 'name isPublic')

    if (!file) {
        const error = new Error("File not found")
        error.statusCode = 404
        throw error
    }

    // we will think about this later
    const hasAccess = file.owner._id.toString() === userId.toString() 
    //     file.isPublic ||
    //     (file.folderId && file.folderId.isPublic)

    if (!hasAccess) {
        const error = new Error("You don't have permission to access this file")
        error.statusCode = 403
        throw error
    }

    return res.status(200).json({
        success: true,
        file
    })
})

const updateFileMetadata = asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id
    const { originalName, isPublic } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid file ID")
        error.statusCode = 400
        throw error
    }

    const file = await File.findById(id)

    if (!file) {
        const error = new Error("File not found")
        error.statusCode = 404
        throw error
    }

    if (file.owner.toString() !== userId.toString()) {
        const error = new Error("You don't have permission to update this file")
        error.statusCode = 403
        throw error
    }

    if (originalName && originalName.trim() !== '') {
        file.originalName = originalName.trim()
    }


    if (typeof isPublic === 'boolean') {
        file.isPublic = isPublic
    }


    await file.save()

    const updatedFile = await File.findById(id)
        .populate('owner', 'username email')
        .populate('folderId', 'name')

    return res.status(200).json({
        success: true,
        message: "File metadata updated successfully",
        file: updatedFile
    })
})

const deleteFile = asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid file ID")
        error.statusCode = 400
        throw error
    }

    const file = await File.findById(id)

    if (!file) {
        const error = new Error("File not found")
        error.statusCode = 404
        throw error
    }

    if (file.owner.toString() !== userId.toString()) {
        const error = new Error("You don't have permission to delete this file")
        error.statusCode = 403
        throw error
    }
    let response = undefined
    console.log(" public id ", file.metadata.publicId)
    if (file.metadata && file.metadata.publicId) {
        try {
            response = await deleteFileFromCloudinary(file.metadata.publicId)
            console.log("File deleted from Cloudinary:", file.metadata.publicId)
        } catch (error) {
            console.error("Error deleting file from Cloudinary:", error)
            const err = new Error(`error form cloudinary : ${error?.message}`)
            error.statusCode = error?.http_code
            throw err
        }
    }
    
    await File.findByIdAndDelete(id)

    return res.status(200).json({
        success: true,
        message: "File deleted successfully" ,
        response
    })
})

module.exports = { uploadFile, getFilesByFolder, getFileById, updateFileMetadata, deleteFile }       