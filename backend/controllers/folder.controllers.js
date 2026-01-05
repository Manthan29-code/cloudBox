const Folder = require("../models/folder.model")
const asyncHandler = require("../middleware/asyncHandler")
const mongoose = require("mongoose")

/**
 * POST /api/folders
 * Create new folder (root or child)
 */
const createFolder = asyncHandler(async (req, res) => {
 // console.log("inside create folder" )
    const { name, parentId, isPublic } = req.body

    if (!name) {
        const error = new Error("folder name is required")
        error.statusCode = 400
        throw error
    }

    let path = []

    if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            const error = new Error("invalid parent folder id")
            error.statusCode = 400
            throw error
        }
        
        const parentFolder = await Folder.findOne({
            _id: parentId,
            owner : req.user._id
        })
        console.log("DEBUG: parentFolder Object keys:", Object.keys(parentFolder.toObject ? parentFolder.toObject() : parentFolder));
        console.log("parentFolder name check: >>>" + parentFolder.name + "<<<");
        if (!parentFolder) {
            const error = new Error("parent folder not found")
            error.statusCode = 404
            throw error
        }
        console.log(" parent folder owner ", parentFolder.owner.toString( ))
        console.log(" current user ", req.user.toString())

        if (parentFolder.owner.toString != req.user.toString()) {
            const error = new Error("You don't have permission to create folder in this parent")
            error.statusCode = 403
            throw error
        }

        path = [...parentFolder.path, parentFolder._id]
        console.log("path " , path)
    }

    const folder = await Folder.create({
        name :name,
        parentId: parentId || null,
        path : path,
        isPublic: isPublic ? true : false,
        owner: req.user._id
    })      
    await folder.populate([
        { path: 'owner', select: 'username email' },
        { path: 'parentId', select: 'name' }
    ])

    return res.status(201).json({
        success: true,
        message: "Folder created successfully",
        folder: folder
    });
})


module.exports  = { createFolder}


