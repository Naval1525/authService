import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import { requestLogger } from "./core/middleware/logger.middleware.js";
import { errorHandler } from "./core/middleware/error.middleware.js";
import { notFound } from "./core/middleware/notFound.middleware.js";
const app = express();

app.use(cors());
app.use(requestLogger);
app.use(helmet());

app.use(express.json());

app.use("/api/v1", routes);

// API docs (Swagger UI at /docs, raw spec at /docs.json)
app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 for unmatched routes, then the centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;