// models/ActivityLog.js
const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true
            // examples: upload, delete, share, download
        },

        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        resourceType: {
            type: String,
            enum: ["file", "folder"],
            required: true
        },

        ipAddress: {
            type: String,
            default: null
        },

        metadata: {
            type: Object,
            default: {}
        }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

module.exports = mongoose.model("ActivityLog", activityLogSchema)
