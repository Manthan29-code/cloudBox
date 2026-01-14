const ActivityLog = require("../models/activityLog.model")


/**
 * Create a new activity log entry
 **/
const createActivityLog = async ({ shareId, accessedBy, action, ipAddress, userAgent }) => {
    try {
        // Validate required fields
        if (!shareId || !accessedBy || !action) {
            throw new Error("shareId, accessedBy, and action are required")
        }

        // Sanitize data
        const sanitizedData = {
            shareId,
            accessedBy,
            action,
            ipAddress: sanitizeIP(ipAddress),
            userAgent: sanitizeUserAgent(userAgent)
        }

        // Create log entry
        const log = await ActivityLog.create(sanitizedData)
        return log
    } catch (error) {
        console.error("Error creating activity log:", error.message)
        throw error
    }
}

const sanitizeIP = (ip) => {
    if (!ip) return null

    // Remove any potential injection characters
    const sanitized = ip.replace(/[^0-9a-fA-F:.]/g, "")

    // Limit length
    return sanitized.substring(0, 45)
}


const sanitizeUserAgent = (userAgent) => {
    if (!userAgent) return null

    // Remove potential injection characters
    const sanitized = userAgent.replace(/[<>]/g, "")

    // Limit length
    return sanitized.substring(0, 500)
}


/**
 * Batch create activity logs (for future optimization)
 */
const batchCreateLogs = async (logsArray) => {
    try {
        if (!Array.isArray(logsArray) || logsArray.length === 0) {
            throw new Error("logsArray must be a non-empty array")
        }

        // Sanitize all logs
        const sanitizedLogs = logsArray.map(log => ({
            shareId: log.shareId,
            accessedBy: log.accessedBy,
            action: log.action,
            ipAddress: sanitizeIP(log.ipAddress),
            userAgent: sanitizeUserAgent(log.userAgent)
        }))

        const logs = await ActivityLog.insertMany(sanitizedLogs)
        return logs
    } catch (error) {
        console.error("Error in batch creating logs:", error.message)
        throw error
    }
}

/**
 * Get logs by share ID
 */
const getLogsByShareId = async (shareId, options = {}) => {
    try {
        const { page = 1, limit = 20, action, startDate, endDate } = options

        // Build query
        const query = { shareId }

        if (action) {
            query.action = action
        }

        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) query.createdAt.$gte = new Date(startDate)
            if (endDate) query.createdAt.$lte = new Date(endDate)
        }

        // Fetch logs with pagination
        const logs = await ActivityLog.find(query)
            .populate("accessedBy", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const total = await ActivityLog.countDocuments(query)

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error("Error fetching logs by shareId:", error.message)
        throw error
    }
}


/**
 * Get logs by user ID
 */
const getLogsByUserId = async (userId, options = {}) => {
    try {
        const { page = 1, limit = 20 } = options

        const logs = await ActivityLog.find({ accessedBy: userId })
            .populate("shareId")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const total = await ActivityLog.countDocuments({ accessedBy: userId })

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error("Error fetching logs by userId:", error.message)
        throw error
    }

}

/**
 * Get analytics for a share
 */
const getShareAnalytics = async (shareId) => {
    try {
        if (!shareId) throw new Error("shareId is required")

        const logs = await ActivityLog.find({ shareId })

        let views = 0
        let downloads = 0
        let share = 0
        let users = new Set()
        let lastAccess = null

        for (let log of logs) {
            if (!log.action || !log.accessedBy) continue

            users.add(log.accessedBy.toString())

            if (log.action === "view") views++
            if (log.action === "download") downloads++
            if (log.action === "share") share++

            if (!lastAccess || new Date(log.createdAt) > new Date(lastAccess)) {
                lastAccess = log.createdAt
            }
        }

        const analytics = {
            totalAccess: logs.length,
            totalViews: views,
            totalDownloads: downloads,
            uniqueUsers: users.size,
            lastAccess,
            actionBreakdown: {
                views,
                downloads,
                share
            }
        }

        return analytics
    } catch (error) {
        console.error("Error getting share analytics:", error.message)
        throw error
    }
}

const formatActionName = (action) => {
    const actionMap = {
        share: "Shared",
        view: "Viewed",
        download: "Downloaded"
    }
    return actionMap[action] || action
}


module.exports = { createActivityLog, batchCreateLogs, getLogsByShareId, getLogsByUserId, getShareAnalytics, formatActionName }