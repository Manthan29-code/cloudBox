const  multer =  require("multer");
const path = require("path")
const { v4: uuidv4 } = require("uuid")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("inside , multer")
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        const username = req.user?.username || "guest"   // adjust based on your auth
        const uuid = uuidv4()
        const random4 = Math.floor(1000 + Math.random() * 9000)
        const ext = path.extname(file.originalname)

        const finalName = `${username}-${uuid}-${random4}${ext}`
        console.log("new file name " , finalName , " original name  " , file.originalname)
        cb(null, finalName)
    }
})

const fileFilter = (req, file, cb) => {
    console.log("inside filFilter ")

    const ext = path.extname(file.originalname).toLowerCase()

    // allow all images
    if (file.mimetype.startsWith("image")) {
        return cb(null, true)
    }
    console.log("file mintyoe " , file.mimetype)
    console.log("file ext " , ext)
    // allow only doc & pdf and .docx
    const allow = [".pdf", ".doc", ".docx"]

    if (allow.includes(ext)) {
        return cb(null, true)
    }

    const error = new Error(`Only ${allow.join(", ")} files allowed`)
    error.statusCode = 400
    cb(error, false)
}

const upload = multer({ 
    storage ,
    fileFilter ,
    limits: { fileSize: 50 * 1024 * 1024  } // 50MB 
})

module.exports = {upload}