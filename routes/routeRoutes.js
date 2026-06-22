import express from "express";

import { recommendRoute, recommendSmartRoute } from "../controllers/routeController.js";

const router = express.Router();

router.post("/recommend", recommendRoute);

router.post("/recommend-smart", recommendSmartRoute);

export default router;