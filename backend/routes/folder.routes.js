const express = require("express")
const {
    createFolder, getFoldersByParent, getRootFolders, updateFolder, deleteChildrenRecursively
} = require("../controllers/folder.controllers")
const {verifyJWT} = require("../middleware/auth.middleware")

const router = express.Router()

router.post("/", verifyJWT, createFolder)
router.get("/", verifyJWT, getRootFolders)
router.get("/:id", verifyJWT, getFoldersByParent)
router.put("/:id", verifyJWT, updateFolder)
router.delete("/:id", verifyJWT, deleteChildrenRecursively)

module.exports = router
