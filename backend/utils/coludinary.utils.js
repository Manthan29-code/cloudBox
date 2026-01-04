const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const { existsSync } = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath, folder) => {
    
    try {
        console.log("inside cloudinary ", localFilePath)
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" ,
            folder: folder 
        })
        console.log("file is uploaded on cloudinary ", response.url)
        await fs.unlink(localFilePath)
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error)

        if (localFilePath && existsSync(localFilePath)) {
            await fs.unlink(localFilePath)
        }

        return null    
    }
}

const extractPublicIdFromCloudinaryUrl = (url) => {
    if (!url || typeof url !== "string") return null

    try {
        // remove query params
        const cleanUrl = url.split("?")[0]

        // split by '/'
        const parts = cleanUrl.split("/")

        // find index of 'upload'
        const uploadIndex = parts.findIndex(part => part === "upload")

        if (uploadIndex === -1) return null

        // everything after version (v123456)
        const publicIdParts = parts.slice(uploadIndex + 2)

        // remove file extension
        const fileName = publicIdParts.pop().split(".")[0]

        return [...publicIdParts, fileName].join("/")
    } catch (error) {
        return null
    }
}

const deleteFromCloudinary = async (url) => {
    if (!url) return
    const public_id = extractPublicIdFromCloudinaryUrl(url)
    console.log("url " , url)
    console.log("public_id" , public_id)
    try {
        const answer = await cloudinary.uploader.destroy(public_id)
        console.log(" old image deleted")
        return answer
    } catch (error) {
        
        console.error("Cloudinary Delete Error:", error)
    }
}

module.exports = {
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary
};

// secure_url https://res.cloudinary.com/djfqwpuzh/image/upload/v1767542919/profile_pics/bqrvekboifmmnagxkgil.png
// public id profile_pics / bqrvekboifmmnagxkgil