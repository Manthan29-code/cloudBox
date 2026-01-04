const loggerMiddleware = (req, res, next) => {
    const now = new Date();

    const log = {
        method: req.method,
        url: req.originalUrl,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    };

    console.log( "{ " , log.method , " }" ,  " " , log.url , " " , log.date ,  " " , log.time );
    next(); // pass control to next middleware / route
};

module.exports = loggerMiddleware;