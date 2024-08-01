import express from "express";
import { renderHome } from "../controllers/chatController";

const router = express.Router();

router.get("/", renderHome);

export default router;
