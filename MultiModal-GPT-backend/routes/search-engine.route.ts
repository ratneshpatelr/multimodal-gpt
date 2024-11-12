import { Router } from "express";
import { ResearchController } from "../controller/research.controller";
import rateLimitMiddleware from "../middleware/use-rate-limit";

const SearchEngine = Router();

SearchEngine.post(
  "/research",
  rateLimitMiddleware,
  // @ts-ignore
  ResearchController
);

export default SearchEngine;
