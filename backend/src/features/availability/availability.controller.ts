import { Request, Response, NextFunction } from "express";
import { getAvailability } from "./availability.service.js";
import { availabilityRequestSchema } from "./availability.schemas.js";

export function handleGetAvailability(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = availabilityRequestSchema.parse(req.body);
    const result = getAvailability(parsed);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
