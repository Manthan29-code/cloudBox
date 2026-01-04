// models/Folder.js
const mongoose = require("mongoose")

const folderSchema = new mongoose.Schema(
    {
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        path: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Folder"
            }
        ],

        isPublic: {
            type: Boolean,
            default: false
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
)
const Folder = mongoose.model("Folder", folderSchema)
module.exports = Folder
