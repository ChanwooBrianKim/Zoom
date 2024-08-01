import express from "express";
import chatRoutes from "./chat";
import authRoutes from "./auth";

const router = express.Router();

router.use("/", chatRoutes);
router.use("/auth", authRoutes);

export default router;
