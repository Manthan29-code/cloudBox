const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        profilePic: {
            type: String, // Cloudinary URL
            default: null,
        },
    },
    {
        timestamps: true,
    }
);



userSchema.pre("save", async function () {
    console.log("inside hash password");

    if (!this.isModified("password")) return ;      

    this.password = await bcrypt.hash(this.password, 10)

    console.log("hashed password:", this.password)
})         

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}

const User = mongoose.model("User", userSchema)             

module.exports = User ;
