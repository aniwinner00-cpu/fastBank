require("dotenv").config();

const express = require("express");
const connectDB = require("./Configs/database");

// Routes
const accountRoute = require("./Routes/accountRoute");
const userRoute = require("./Routes/userRoute");
const transactionRoute = require("./Routes/transactionRoute");
const nibssRoute = require("./Routes/nibssRoute");

// Middleware
const limiter = require("./Middleware/rateLimiter");

const app = express();

// Connect MongoDB
connectDB();

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware
app.use(limiter);

// Base Route
app.get("/", (req, res) => {
    res.status(200).send("Fast Bank API is running...");
});

// API Routes
app.use("/api/users", userRoute);
app.use("/api/accounts", accountRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/nibss", nibssRoute);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error:", err.stack);

    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error"
    });
});

// Server Port
const PORT = process.env.PORT || 2002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});