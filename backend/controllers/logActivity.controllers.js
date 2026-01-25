// const Folder = require("../models/folder.model")
const ActivityLog = require("../models/activityLog.model")
const asyncHandler = require("../middleware/asyncHandler")
const mongoose = require("mongoose")
const Share = require("../models/share.model.js")
const logService = require("../utils/logs.service.js")



/**
 * @desc    Get activity logs for a specific share
 * @route   GET /logs/share/:shareId
 * @access  Private (owner only)
 */
const getLogsByShare = asyncHandler(async (req, res) => {
    const { shareId } = req.params
    const { page, limit, action, startDate, endDate } = req.query

    // Find share and verify ownership
    const share = await Share.findById(shareId)

    if (!share) {
        const error = new Error("Share not found")
        error.statusCode = 404
        throw error
    }

    // Check if user is the owner
    if (share.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error("Unauthorized to view logs for this share")
        error.statusCode = 403
        throw error
    }

    // Get logs with filters
    const result = await logService.getLogsByShareId(shareId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        action,
        startDate,
        endDate
    })

    res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination
    })
})

/**
 * @desc    Get all activity logs for current user
 * @route   GET /logs/my-activity
 * @access  Private
 */
const getMyActivityLogs = asyncHandler(async (req, res) => {
    const { page, limit } = req.query

    const result = await logService.getLogsByUserId(req.user._id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
    })

    res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination
    })
})

/**
 * @desc    Get all logs for shares created by user(admin view)
 * @route   GET/logs/my-shares-activity
 * @access  Private
*/
const getMySharesActivity = asyncHandler(async (req, res) => {
    const pageNum = parseInt(req.query.page) || 1
    const limitNum = parseInt(req.query.limit) || 20
    const skip = (pageNum - 1) * limitNum


    const result = await ActivityLog.aggregate([
        // Join with shares
        {
            $lookup: {
                from: "shares",
                localField: "shareId",
                foreignField: "_id",
                as: "share"
            }
        },
        { $unwind: "$share" },

        // Filter only shares created by logged-in user
        {
            $match: {
                "share.createdBy": req.user._id
            }
        },

        // Join with users
        {
            $lookup: {
                from: "users",
                localField: "accessedBy",
                foreignField: "_id",
                as: "accessedBy"
            }
        },
        { $unwind: "$accessedBy" },

        // SELECT REQUIRED FIELDS (replacement of populate select)
        {
            $project: {
                _id: 1,
                createdAt: 1,

                // share fields
                "share._id": 1,
                "share.title": 1,
                "share.slug": 1,

                // user fields
                "accessedBy._id": 1,
                "accessedBy.name": 1,
                "accessedBy.email": 1
            }
        },

        // Sort latest first
        { $sort: { createdAt: -1 } },

        // Pagination + total count
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limitNum }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ])


    const logs = result[0].data
    const total = result[0].totalCount[0]?.count || 0

    res.status(200).json({
        success: true,
        data: logs,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    })
})

/**
 * @desc    Get aggregated analytics for user's shares
 * @route   GET /logs/analytics/overview
 * @access  Private
 */
const getOverviewAnalytics = asyncHandler(async (req, res) => {
    // Find all shares created by user
    const shares = await Share.find({ createdBy: req.user._id }).select("_id")
    const shareIds = shares.map(share => share._id)

    // Handle case when user has no shares
    if (shareIds.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                totalShares: 0,
                totalAccess: 0,
                totalViews: 0,
                totalDownloads: 0,
                uniqueUsers: 0
            }
        })
    }

    // Get aggregated analytics for ALL shares in one call
    const analytics = await logService.getShareAnalytics(shareIds)

    // Get recent activity for the overview
    const recentLogs = await ActivityLog.find({ shareId: { $in: shareIds } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('action createdAt shareId')

    // Build response
    res.status(200).json({
        success: true,
        data: {
            totalShares: shares.length,
            totalAccess: analytics.totalAccess,
            totalViews: analytics.totalViews,
            totalDownloads: analytics.totalDownloads,
            uniqueUsers: analytics.uniqueUsers,
            recentActivity: recentLogs.map(log => ({
                action: log.action,
                timestamp: log.createdAt,
                shareId: log.shareId
            }))
        }
    })
})

/**
 * @desc    Export logs to CSV format
 * @route   GET /logs/export/:shareId
 * @access  Private (owner only)
 */
const exportLogsToCSV = asyncHandler(async (req, res) => {
    const { shareId } = req.params

    // Find share and verify ownership
    const share = await Share.findById(shareId)

    if (!share) {
        const error = new Error("Share not found")
        error.statusCode = 404
        throw error
    }

    if (share.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error("Unauthorized to export logs for this share")
        error.statusCode = 403
        throw error
    }

    // Get all logs for this share
    const ActivityLog = require("../models/activityLog.model.js")
    const logs = await ActivityLog.find({ shareId })
        .populate("accessedBy", "name email")
        .sort({ createdAt: -1 })

    // Convert to CSV format
    const csvHeader = "Timestamp,Action,User Name,User Email,IP Address,User Agent\n"
    const csvRows = logs.map(log => {
        return `${log.createdAt.toISOString()},${log.action},${log.accessedBy?.name || "N/A"},${log.accessedBy?.email || "N/A"},${log.ipAddress || "N/A"},${log.userAgent || "N/A"}`
    }).join("\n")

    const csv = csvHeader + csvRows

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename=share-logs-${shareId}.csv`)

    res.status(200).send(csv)
})


module.exports = { getLogsByShare, getMyActivityLogs, getMySharesActivity, getOverviewAnalytics, exportLogsToCSV }