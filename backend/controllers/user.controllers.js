const User = require('../models/user.model')
const asyncHandler = require('../middleware/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.utils');
// const jwt = require("jsonwebtoken")

const createUser = asyncHandler(
    async ( req ,res ) => {
        console.log("inside createUser")
        let profilePic = null;

        console.log(req.body )

        // const isUserExists = User.findOne({email})
        // console.log("isUserExists ", isUserExists)
        // if (isUserExists){
        //     const error = new Error("user with provided email already exists")
        //     error.statusCode = 401
        //     throw error
        // }

        if (req.file) {
            const uploadRes = await uploadToCloudinary(
                req.file.path,
                "profile_pics"
            );
            console.log("secure_url", uploadRes.secure_url)
            console.log("public id", uploadRes.public_id)  
            profilePic = uploadRes.secure_url;
        }

        const user = await User.create({
            ...req.body,
            profilePic,
        });

        return res.status(201).json({
            success: true,
            data: user,
        });
    
    }
)

const login = asyncHandler( async ( req  ,  res ) => {
    const {email , password} = req.body 
    console.log("email " , email , " password " , password)
    if ( !email || !password){
        const error = new Error("email or  password is not provided")
        error.statusCode = 401
        throw error
    }
    const user = await User.findOne({ email})

    if(!user){
        const error = new Error("user with provided email not exists")
        error.statusCode = 401
        throw error
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid){
        const error = new Error("enter correct password")
        error.statusCode = 401
        throw error
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const accessToken = user.generateAccessToken()

    const { password: _, ...safeUser } = user.toObject()
    return res.status(202)
        .cookie("accessToken", accessToken, options)
        .json({ user: safeUser, accessToken: accessToken })

})


const logout = asyncHandler( async (req, res ) => {
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json({ success: true, message: `${req.user.name} Logged out` });

})

const getAllUsers = asyncHandler(async (req, res) => {
    const { search } = req.query

    if (!search) {
        return res.status(200).json({
            success: true,
            data: []
        })
    }

    const users = await User.find({
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    })
        .select("_id name email")
        .limit(10)

    res.status(200).json({
        success: true,
        data: users
    })
})


const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")
    

    if (!user) {
        const error = new Error("User not found")
        error.statusCode = 404
        throw error
    }

    res.status(202).json({ success: true, data: user })
})

const updateUser = asyncHandler(async (req, res) => {
    console.log("user in cookie ", req.user)
    console.log("req.params.id", req.params.id , " <===> ", req.user._id )
    const user = await User.findById(req.params.id)

    if (!user) {
        const error = new Error("User not found")
        error.statusCode = 404
        throw error
    }

    // update fields
    if (req.body.name) user.name = req.body.name
    if (req.body.email) user.email = req.body.email
    if (req.body.role) user.role = req.body.role

    
    if (req.body.password) {
        console.log("new password ", req.body.password)
        user.password = req.body.password
    }

    if (req.file) {
        // const deleteResponse = await deleteFromCloudinary(user.profilePic)
        // console.log(" delete responce ", deleteResponse )
        // const uploadRes = await uploadToCloudinary(
        //     req.file.path,
        //     "profile_pics"
        // )
        // user.profilePic = uploadRes.secure_url

        
        console.log("📸 New profile picture detected")
        console.log("📌 Current profile pic URL:", user.profilePic)

        // Delete old image FIRST (before upload)
        if (user.profilePic) {
            const deleteResponse = await deleteFromCloudinary(user.profilePic)
            console.log("🗑️  Delete response:", JSON.stringify(deleteResponse, null, 2))
        }

        // Upload new image
        console.log("⬆️  Uploading new image...")
        const uploadRes = await uploadToCloudinary(
            req.file.path,
            "profile_pics"
        )
        if (!uploadRes) {
            const error = new Error("Failed to upload image to Cloudinary")
            error.statusCode = 500
            throw error
        }

        console.log("✅ New image uploaded:", uploadRes.secure_url)
        console.log("✅ New image uploaded:", uploadRes)
        user.profilePic = uploadRes.secure_url
    }

    await user.save()

    res.status(202).json({
        success: true,
        data: user.toObject({ transform: (_, ret) => { delete ret.password ;return ret } }),
    })
})


const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
        const error = new Error("User not found")
        error.statusCode = 404
        throw error
    }
    const deleteResponse = await deleteFromCloudinary(user.profilePic)
    console.log(" delete response ", deleteResponse)

    res.json({ success: true, message: "User deleted successfully" })
})

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, login, logout }
