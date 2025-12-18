// api/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "../src/config/db.js";
import { Review } from "../src/models/Review.js";

dotenv.config();

const app = express();

// IMPORTANT: In Vercel serverless, don't use credentials with wildcard.
// Also note: many requests will have no Origin (like curl) — allow those.
const allowedOrigins = [
    "http://localhost:5173",
    "https://the-profilr.onrender.com",
    // add your Vercel frontend domain here later:
    // "https://your-frontend.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) callback(null, true);
            else callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    })
);

app.use(express.json());

// Connect DB lazily (per cold start) and cache it:
let dbReady = false;
async function ensureDB() {
    if (!dbReady) {
        await connectDB();
        dbReady = true;
    }
}

app.get("/", async (req, res) => {
    res.status(200).send("Profilr backend running successfully");
});

app.get("/api/reviews", async (req, res) => {
    try {
        await ensureDB();
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/reviews", async (req, res) => {
    try {
        await ensureDB();

        const { name, role, comment } = req.body;
        if (!name || !role || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const review = new Review({ name, role, comment });
        await review.save();

        return res.status(201).json({ message: "Review added", review });
    } catch (error) {
        console.error("Error adding review:", error.message);
        return res
            .status(500)
            .json({ message: "Failed to add review", error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// DO NOT app.listen() on Vercel:
export default app;