const globalErrorHandler = (err, req, res , next) => {
    // Set a default status code if none exists
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};                                                      

module.exports = globalErrorHandler;