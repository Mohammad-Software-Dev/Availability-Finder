import { Request, Response, NextFunction } from "express";
import { getAllPeople } from "./people.service.js";

export function handleGetPeople(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = getAllPeople();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
