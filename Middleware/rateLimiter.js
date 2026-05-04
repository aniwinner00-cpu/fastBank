const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 5 * 1000,
    max: 1,
    message: "Too many requests. Please wait 5 seconds."
});

module.exports = limiter;

