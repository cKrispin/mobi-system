import express from "express";

import {

createAlert,
getAlerts,
trafficSummary

}

from "../controllers/alertController.js";

import { protect }

from "../middleware/authMiddleware.js";

const router=

express.Router();


router.post(

"/",

protect,

createAlert

);

router.get(

"/",

protect,

getAlerts

);

router.get(

"/traffic-summary",

protect,

trafficSummary

);

export default router;