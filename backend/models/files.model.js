const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
            trim: true
        },

        originalName: {
            type: String,
            required: true
        },

        cloudUrl: {
            type: String,
            required: true
        },

        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null
        },

        mimeType: {
            type: String,
            required: true
        },

        size: {
            type: Number,
            required: true
        },

        isPublic: {
            type: Boolean,
            default: false
        },

        metadata: {
            type: Object,
            default: {}
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
)
const File = mongoose.model("File", fileSchema)
module.exports = File