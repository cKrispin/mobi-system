import express from "express";

import {

    createReport

} from "../controllers/reportController.js";

const router =
express.Router();

router.get(
    "/",
    createReport
);

export default router;