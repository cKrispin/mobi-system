import express from "express";

import { register, login, getUsers } from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";


const router= express.Router();

router.post("/register", register);

router.post("/login",login);

router.get("/users", protect, adminOnly, getUsers);

export default router;