import { Router } from "express";
import { handleGetAvailability } from "./availability.controller.js";

const router = Router();

router.post("/availability", handleGetAvailability);

export default router;
