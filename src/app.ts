import express from "express";
import cors from "cors";
import helmet from "helmet";


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

app.use(errorHandler);
app.use(notFound);
export default app;