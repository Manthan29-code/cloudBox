const asyncHandler  = require("./asyncHandler.js")
const jwt = require("jsonwebtoken") 
const  User = require("../models/user.model.js")

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            const error = new Error("token not found")
            error.statusCode = 401
            throw error
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password")

        if (!user) {

            const error = new Error("token invalid")
            error.statusCode = 401
            throw error
        }

        req.user = user;
        next()
    } catch (err) {
        const error = new Error(`${err?.message}` || "Invalid access token")
        error.statusCode = 401
        throw error
    }

})

module.exports = { verifyJWT }