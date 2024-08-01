import express from "express";
import passport from "../passportConfig";
import { signup } from "../controllers/authController";

const router = express.Router();

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
}));

router.post("/signup", signup);

export default router;
