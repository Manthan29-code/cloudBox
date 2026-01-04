const express = require("express")
const router = express.Router();
const {upload} = require("../middleware/multer.middleware");
const { createUser, getAllUsers, getUserById, updateUser, deleteUser , login  , logout} = require("../controllers/user.controllers");
const { verifyJWT } = require("../middleware/auth.middleware");

router.post("/register", upload.single("profilePic"), createUser)
router.post("/login" , login)
router.get("/", verifyJWT , getAllUsers)
router.get("/:id", verifyJWT , getUserById)
router.put("/:id", verifyJWT ,upload.single("profilePic"), updateUser)
router.delete("/:id", verifyJWT ,deleteUser)
router.post("/logout", verifyJWT ,logout)

module.exports = router