const Share = require("../models/share.model")
const File = require("../models/files.model")
const asyncHandler = require("../middleware/asyncHandler")
const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
// const crypto = require("crypto")
const logService = require("../utils/logs.service")


// <!-- ** What I understand from your request:**
//     You want ** controller - level design guidance(no code) ** for your system based on:

// * Share schema
//     * Activity log schema
//         * Features:

//   * share files / folders
//     * multi - user access
//         * permission control
//             * secure links
//                 * expiry
//                 * tracking
//                 * You ** don’t want revoke logic **
// * You’re asking if ** share + log should be mixed or separated **

//     ---

// # First answer(very clear)

// ❌ ** Do NOT mix Share and Log controllers **
// ✅ Keep them ** separate but connected **

//     Why ?

// | Concern | Reason |
// | ------- | ----------------------------- |
// | Share | Business logic(access rules) |
// | Log | Audit trail(history) |

//     Mixing them =

// * messy code
//     * hard debugging
//         * poor scalability

// ---

// # Clean architecture

//     ```
// controllers/
//  ├── share.controller.js
//  ├── log.controller.js
// ```

// Logs are:

// > ** Side effects of share actions **

//     So:

// * share controller ** triggers log **
// * but log controller never controls share

// ---

// # SHARE CONTROLLER – Responsibilities

// ### 1) Create Share

// Purpose:

// * owner selects file / folder
//     * selects users
//         * sets permissions
//             * sets expiry
//                 * generate token

// Flow:

// 1. validate owner
// 2. validate users exist
// 3. validate permissions
// 4. calculate expiresAt
// 5. generate JWT token
// 6. save Share document

// ---

// ### 2) Access Shared Resource

// Purpose:

// * user clicks share link

// Flow:

// 1. verify JWT token
// 2. fetch Share document
// 3. check:

//    * token valid
//     * not expired
//         * user is in allocatedTo
// 4. allow access
// 5. trigger ** log entry **

//     ---

// ### 3) Download Resource

// Purpose:

// * user downloads file

// Flow:

// 1. verify token
// 2. check permission.download
// 3. stream file
// 4. trigger ** download log **

//     ---

// ### 4) Get All Shares by User

// Purpose:

// * dashboard

// Examples:

// * files I shared
//     * files shared with me

// ---

// ### 5) Validate Share Token

// Purpose:

// * lightweight check
//     * frontend validation

// ---

// # LOG CONTROLLER – Responsibilities

// ### 1) Create Log

// Triggered internally by:

// * view
//     * download

// Not public API.

// ---

// ### 2) Get Logs for a Share

// Purpose:

// * owner wants activity report

// Examples:

// * who viewed
//     * when
//     * how many times

// ---

// ### 3) Analytics(optional later)

//     * total views
//         * unique users
//             * last access time

// ---

// # How they connect

//     ```
// User → ShareController → Access granted
//                      ↘ create log
// ```

// Log controller ** never decides access **
//     Only records.

// ---

// # How your schema fits perfectly

// Your log schema is correct:

// ```js
// shareId     → what was accessed
// accessedBy  → who accessed
// action      → view / download
// ipAddress   → traceability
// userAgent   → device info
// createdAt   → when
// ```

// This gives:

// ✔ audit trail
// ✔ leak tracing
// ✔ usage analytics

// ---

// # Feature mapping to controllers

//     | Feature | Controller |
// | -------------- | ---------- |
// | Share files | Share |
// | Multiple users | Share |
// | Permissions | Share |
// | Secure link | Share |
// | Expiry | Share |
// | Track activity | Log |

//     ---

// # Without revoke(your choice)

// That’s fine.

// Your control is:

// * only expiry
//     * no manual cancel

// That is valid design.

// ---

// # Professional interview explanation

// If asked:

// > Why separate controllers ?

//     Answer :

// > Sharing is business logic
//     > Logging is audit logic
//         > Separation keeps code clean
//             > and scalable.

// ---

// # Mentor advice

// You are designing this ** very well **:

// * no over engineering
//     * clear separation
//         * real - world thinking

// This is how production code is written.

// ---

// # Final verdict

// ✔ Separate Share & Log controllers
// ✔ Share triggers log internally
// ✔ Log never controls share
// ✔ Your schema is perfect

// ---

//     If you want next:

// * API route design
//     * middleware flow
//         * error strategy
//             * permission matrix
// Just say 🚀 -->      

/**
 * @desc    Create a new share
 * @route   POST /shares/create
 * @access  Private
 */
const createShare = asyncHandler(async (req, res) => {
    const { resourceId, resourceType, allocatedTo, permissions, hours, minutes, days, expiresAt: customExpiresAt } = req.body

    // Validate required fields
    if (!resourceId || !resourceType) {
        const error = new Error("resourceId and resourceType are required")
        error.statusCode = 400
        throw error
    }
    // folder is for future use if we need to make folder along with all the file shareable 
    if (!["file", "folder"].includes(resourceType)) {
        const error = new Error("resourceType must be 'file' or 'folder'")
        error.statusCode = 400
        throw error
    }

    // Validate allocatedTo users exist
    if (!allocatedTo || !Array.isArray(allocatedTo) || allocatedTo.length === 0) {
        const error = new Error("allocatedTo must be a non-empty array of user IDs")
        error.statusCode = 400
        throw error
    }

    const users = await User.find({ _id: { $in: allocatedTo } })
    if (users.length !== allocatedTo.length) {
        const error = new Error("One or more users in allocatedTo do not exist")
        error.statusCode = 400
        throw error
    }

    // TODO: Verify user owns the resource ( currently  we are focusing only on  to make file as sharable )
    const resource = await File.findOne({ _id: resourceId, createdBy: req.user._id })
    if (!resource){
        const error = new Error(" you are  not owner of resource ")
        error.statusCode = 400
        throw error
    } 

    // Calculate expiresAt
    let expiresAt
    if (customExpiresAt) {
        expiresAt = new Date(customExpiresAt)
    } else {
        const h = hours || 0
        const m = minutes || 0
        const d = days || 0
        const ms = d * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000 + m * 60 * 1000
        expiresAt = ms > 0 ? new Date(Date.now() + ms) : null
    }

    // Generate unique token
    const uniqueToken = crypto.randomBytes(32).toString("hex")

    // Generate JWT token with expiry
    const jwtPayload = {
        shareId: uniqueToken,
        resourceId,
        resourceType,
        allocatedTo,
        permissions: permissions || { read: true, download: false }
    }

    const jwtOptions = expiresAt
        ? { expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000) }
        : {}

    const jwtToken = jwt.sign(
        jwtPayload,
        process.env.SHARE_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        jwtOptions
    )

    // Create share document
    const share = await Share.create({
        createdBy: req.user._id,
        allocatedTo,
        resourceId,
        resourceType,
        token: jwtToken,
        permissions: permissions || { read: true, download: false },
        expiresAt
    })

    // Log share creation activity
    await logService.createActivityLog({
        shareId: share._id,
        accessedBy: req.user._id,
        action: "share",
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    })

    // Generate public URL
    const baseUrl = process.env.BASE_URL || "http://localhost:3000" // it is url on that your backend is running
    const shareUrl = `${baseUrl}/public/${share._id}`

    res.status(201).json({
        success: true,
        message: "Share created successfully",
        data: {
            shareId: share._id,
            shareUrl,
            token: jwtToken,
            allocatedTo: share.allocatedTo,
            expiresAt: share.expiresAt,
            permissions: share.permissions
        }
    })
})

module.exports = { createShare  }