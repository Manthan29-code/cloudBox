const express = require("express")
require('dotenv').config();
const mongoose = require("mongoose")
const cors = require("cors");
const globalErrorHandler = require("./middleware/errorMiddleware");
const app = express()
const userRouter = require("./routes/user.routes");
const folderRouter = require("./routes/folder.routes");
const fileRouter = require("./routes/file.routes");
const shareRouter = require("./routes/share.routes");
const loggerMiddleware = require("./middleware/logmiddleware");
const cookieParser = require('cookie-parser');
// const pdfProxyRouter = require('./routes/pdfViewr.routes');


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174" ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))



app.options("/", cors())             
app.use(express.json())  
app.use(cookieParser()); 

// const MONGO_URI = "mongodb://127.0.0.1:27017/my_database_name"
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DATABASE_URL;



mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully")
    })
    .catch((error) => {
        console.error("❌ MongoDB connection error:", error)
    })

app.use((loggerMiddleware))
app.get("/test", (req, res) => {
    res.send("Server is running 🚀")
})

app.use("/user" , userRouter)
app.use("/folder", folderRouter)
app.use("/file", fileRouter)
app.use("/shares", shareRouter)
// app.use(pdfProxyRouter)
app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    console.log(`Connecting to: ${MONGO_URI}`);
})