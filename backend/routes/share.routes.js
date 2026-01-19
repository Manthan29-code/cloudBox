const express = require("express")
const router = express.Router()
const { verifyJWT } = require("../middleware/auth.middleware.js")
const {
    createShare,
    accessSharedResource,
    downloadSharedResource,
    getMyShares,
    getSharedWithMe,
    validateShareToken,
    getShareAnalytics
} = require("../controllers/share.controllers")



router.post("/create", verifyJWT, createShare)
router.get("/access/:shareId", verifyJWT, accessSharedResource)
router.get("/download/:shareId", verifyJWT, downloadSharedResource)
router.get("/my-shares", verifyJWT, getMyShares)
router.get("/shared-with-me", verifyJWT, getSharedWithMe)
router.get("/analytics/:shareId", verifyJWT, getShareAnalytics)

// Public route - lightweight validation
router.get("/validate/:shareId", validateShareToken)


module.exports = router