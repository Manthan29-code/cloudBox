const express = require("express")
const router = express.Router()
const { verifyJWT } = require("../middleware/auth.middleware")
const {
    getLogsByShare,
    getMyActivityLogs,
    getMySharesActivity,
    getOverviewAnalytics,
    exportLogsToCSV
} = require("../controllers/logActivity.controllers")

// All routes require authentication
router.use(verifyJWT)

// Get logs for specific share (owner only)
router.get("/share/:shareId", getLogsByShare)

// Get user's own activity logs
router.get("/my-activity", getMyActivityLogs)

// Get all activity on user's created shares
router.get("/my-shares-activity", getMySharesActivity)

// Get aggregated analytics overview
router.get("/analytics/overview", getOverviewAnalytics)

// Export logs to CSV (owner only)
router.get("/export/:shareId", exportLogsToCSV)

module.exports = router