import rateLimiter from "../lib/rate-limiter";
import { NextFunction, Request, Response } from "express";

const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip as string);
    next();
  } catch (error) {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  }
};

export default rateLimitMiddleware;
