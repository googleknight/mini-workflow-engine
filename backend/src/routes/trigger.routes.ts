import { Router } from "express";
import { triggerWorkflow } from "../controllers/trigger.controller";

const router = Router();

router.post("/:triggerPath", triggerWorkflow);

export default router;
