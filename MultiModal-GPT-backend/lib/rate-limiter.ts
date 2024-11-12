import { RateLimiterMemory } from "rate-limiter-flexible";

const opts = {
  points: 6, // Allow 20 requests
  duration: 60, // Per minute
};

const rateLimiter = new RateLimiterMemory(opts);

export default rateLimiter;
