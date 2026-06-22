import express from "express";

import { saveGPS } from "../controllers/gpsController.js";

const router= express.Router();

router.post("/", saveGPS);

export default router;