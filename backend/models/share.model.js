// models/Share.js
const mongoose = require("mongoose")

const shareSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

        token: {
            type: String,
            required: true,
            unique: true
        },

        permissions: {
            type: Object,
            default: {
                read: true,
                write: false
            }
        },

        expiresAt: {
            type: Date,
            default: null
        },

        revoked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Share", shareSchema)
