    // models/ActivityLog.js
const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema(
    {
        shareId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Share",
            required: true
        },

        accessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            enum: ["share" , "view", "download"],
            required: true
        },

        ipAddress: String,
        userAgent: String
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)
const ActivityLog =  mongoose.model("ActivityLog", activityLogSchema)
module.exports = ActivityLog
