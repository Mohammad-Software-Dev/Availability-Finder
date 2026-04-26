import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import availabilityRoutes from "./features/availability/availability.routes.js";
import peopleRoutes from "./features/people/people.routes.js";
import { errorHandler } from "./shared/errors/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);

app.use(express.json());

app.use("/api", availabilityRoutes);
app.use("/api", peopleRoutes);
app.use(errorHandler);

export default app;
