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

    const existingFolder = await Folder.findOne({
        name: name.trim(),
        parentId: parentId || null,
        owner: req.user._id
    });

    if (existingFolder) {
        const error = new Error("Folder with this name already exists in this location")
        error.statusCode = 409
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

        if (!parentFolder) {
            const error = new Error("parent folder not found")
            error.statusCode = 404
            throw error
        }
        console.log(" parent folder owner ", parentFolder.owner.toString( ))
        console.log(" current user ", req.user._id.toString())

        

        // if (parentFolder.owner.toString != req.user._id.toString()) {
        //     const error = new Error("You don't have permission to create folder in this parent")
        //     error.statusCode = 403
        //     throw error
        // }

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


/**
 * GET /api/folders/:id
 * List child folders of given folder
 */
const getFoldersByParent = asyncHandler(async (req, res) => {
    const { id } = req.params
    console.log(" id in get by parent " , id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("invalid folder id")
        error.statusCode = 400
        throw error
    }

    const folders = await Folder.find({
        parentId: id,
        owner: req.user._id
    }).populate('owner', 'username email')
      .populate('parentId', 'name')
      .populate('path', 'name')
      .sort({name : 1})

    if (!folders) {
        const error = new Error("Folder not found");
        error.statusCode = 404;
        throw error;
    }

    // await folders.populate([
    //     { path: 'owner', select: 'username email' },
    //     { path: 'parentId', select: 'name' } ,
    //     {path : 'path' , select :"name"}
    // ])

    

    return res.status(200).json({ success: true,  folders})
})
const getRootFolders = asyncHandler(async (req, res) => {
    console.log("inside get root folder")
    const userId = req.user._id;

    const rootFolders = await Folder.find({
        parentId: null,
        owner: userId
    })
        .populate('owner', 'username email')
        .sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: rootFolders.length,
        folders: rootFolders
    });
});


/**
 * PUT /api/folders/:id
 * Rename / update folder
 */
const updateFolder = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name, isPublic } = req.body
    const userId = req.user._id

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid folder ID")
        error.statusCode = 400
        throw error
    }

    // Find folder
    const folder = await Folder.findById(id)

    if (!folder) {
        const error = new Error("Folder not found")
        error.statusCode = 404
        throw error
    }

    // Check ownership
    if (folder.owner.toString() !== userId.toString()) {
        const error = new Error("You don't have permission to update this folder")
        error.statusCode = 403
        throw error
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== folder.name) {
        const existingFolder = await Folder.findOne({
            name: name.trim(),
            parentId: folder.parentId,
            owner: userId,
            _id: { $ne: id }
        });

        if (existingFolder) {
            const error = new Error("Folder with this name already exists in this location")
            error.statusCode = 409
            throw error
        }

        folder.name = name.trim()
    }

    // Update isPublic if provided
    if (typeof isPublic === 'boolean') {
        folder.isPublic = isPublic
    }

    await folder.save()

    const updatedFolder = await Folder.findById(id)
        .populate('owner', 'username email')
        .populate('parentId', 'name')

    res.status(200).json({
        success: true,
        message: "Folder updated successfully",
        folder: updatedFolder
    });
});


// Delete folder(and optionally its contents)
// DELETE / api / folders /: id
    
            
const deleteFolder = asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id
    const { deleteContents } = req.query // ?deleteContents=true to delete all contents

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid folder ID");
        error.statusCode = 400
        throw error
    }


    const folder = await Folder.findById(id)

    if (!folder) {
        const error = new Error("Folder not found");
        error.statusCode = 404
        throw error
    }

    // Check ownership
    if (folder.owner.toString() !== userId.toString()) {
        const error = new Error("You don't have permission to delete this folder")
        error.statusCode = 403
        throw error
    }

    // Check if folder has children
    const childFolders = await Folder.countDocuments({ parentId: id })
    
    if ((childFolders > 0) && deleteContents !== 'true') {
        const error = new Error(
            "Folder is not empty. Use ?deleteContents=true to delete folder and all its contents"
        )
        error.statusCode = 400
        throw error
    }

    // If deleteContents is true, recursively delete all contents
    if (deleteContents === 'true' && (childFolders > 0)) {
        await deleteChildrenRecursively(id)
    }

    // Delete the folder itself
    await Folder.findByIdAndDelete(id)

    res.status(200).json({
        success: true,
        message: "Folder deleted successfully"
    })
})

/**
 * Helper function to recursively delete all children folders and files
 */
const deleteChildrenRecursively = async (folderId) => {
    // 1. Find all immediate children
    const childFolders = await Folder.find({ parentId: folderId }).select('_id')

    if (childFolders.length > 0) {
        // 2. Map through children and trigger their deletions in parallel
        // Using Promise.all is much faster than awaiting each in a for-loop
        await Promise.all(
            childFolders.map(child => deleteChildrenRecursively(child._id))
        );

        // 3. Delete all children whose parent is this folder
        await Folder.deleteMany({ parentId: folderId })
    }
};


/**

 * Helper function to recursively delete all children folders and files

 */

// const deleteChildrenRecursively = async (folderId) => {
//     const childFolders = await Folder.find({ parentId: folderId })
//     // Recursively delete each child folder's contents
//     for (const child of childFolders) {
//         await deleteChildrenRecursively(child._id)
//     }
//     // Delete all child folders
//     await Folder.deleteMany({ parentId: folderId })

// }


module.exports = { createFolder, getFoldersByParent, getRootFolders, updateFolder, deleteFolder, deleteChildrenRecursively }


