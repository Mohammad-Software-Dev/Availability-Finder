import { Router } from "express";
import { handleGetPeople } from "./people.controller.js";

const router = Router();

router.get("/people", handleGetPeople);

export default router;
