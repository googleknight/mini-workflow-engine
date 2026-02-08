import express from "express";
import cors from "cors";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import workflowRoutes from "./routes/workflow.routes";
import triggerRoutes from "./routes/trigger.routes";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi";
import { errorHandler } from "./middleware/error-handler";

extendZodWithOpenApi(z);

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/workflows", workflowRoutes);
app.use("/t", triggerRoutes);

app.use(errorHandler);

export default app;
