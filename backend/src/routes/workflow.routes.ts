import { Router } from "express";
import { WorkflowController } from "../controllers/workflow.controller";
import { validate } from "../middleware/validate";
import {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
} from "../schemas/workflow.schema";

const router = Router();
const controller = new WorkflowController();

router.post("/", validate(CreateWorkflowSchema), controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.patch("/:id", validate(UpdateWorkflowSchema), controller.update);
router.delete("/:id", controller.delete);

export default router;
