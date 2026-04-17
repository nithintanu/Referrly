import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth";
import referralRoutes from "./routes/referral";
import { errorHandler } from "./middleware/errorHandler";
import { uploadDirectory } from "./middleware/upload";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDirectory));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Referrly API is running",
    data: {
      health: "/health",
      auth: "/api/auth",
      api: "/api",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", referralRoutes);
app.use(errorHandler);

export default app;
