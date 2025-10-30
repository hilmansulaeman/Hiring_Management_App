import { Router } from 'express';
import { DemoResponse } from "@shared/api";

const router = Router();

router.get("/", (_req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
});

export default router;
