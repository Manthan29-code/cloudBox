// models/Share.js
const mongoose = require("mongoose")

const shareSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // owner can give access to multiple user at same time 
        allocatedTo : [{   
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true

        }] ,

        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        resourceType: {
            type: String,
            enum: ["file", "folder"],
            required: true,
        },

        token: { // use jwt token that contain expiry time after that now one can able to access source
            type: String,
            required: true,
            unique: true
        },

        permissions: { 
            type: Object,
            default: {
                read: true,
                download: false
            }
        },

        expiresAt: { // this tme is use to show how long you have access to resource
            type: Date,
            default: null
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Share", shareSchema)
// for expiresAt input mechanism
```Frontend sends
{
    "hours": 2,
        "minutes": 30
}
let expiresAt

if (req.body.expiresAt) {
    expiresAt = new Date(req.body.expiresAt)
} else {
    const { hours = 0, minutes = 0, days = 0 } = req.body

    const ms =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000

    expiresAt = new Date(Date.now() + ms)
}```