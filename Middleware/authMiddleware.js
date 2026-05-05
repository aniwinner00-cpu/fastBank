const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("AUTH HEADER:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. You are unauthorized!"
            });
        }
        const token = authHeader.split(" ")[1];
        console.log("TOKEN:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED:", decoded);

        req.user = decoded;
       
        next();
    
    } catch (error) {
        res.status(401).json({
            message: "You are unauthorized!"
        });
    }
};


module.exports = authMiddleware;