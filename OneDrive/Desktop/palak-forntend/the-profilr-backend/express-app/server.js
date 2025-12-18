import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import { Review } from "./src/models/Review.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://the-profilr.onrender.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  })
);

app.use(express.json());

await connectDB();

app.get("/", (req, res) => {
  res.status(200).send("Profilr backend running successfully");
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, role, comment } = req.body;

    if (!name || !role || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const review = new Review({ name, role, comment });
    await review.save();

    return res.status(201).json({ message: "Review added", review });
  } catch (error) {
    console.error("Error adding review:", error.message);
    return res.status(500).json({ message: "Failed to add review", error: error.message });
  }
});


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));