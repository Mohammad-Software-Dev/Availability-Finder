import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request",
      error: err.issues[0]?.message ?? "Request validation failed",
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.details ? { error: err.details } : {}),
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error",
  });
};
