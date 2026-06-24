import { Router } from "express";
import { googleAuth, googleCallback } from "../controllers/oauth.controller";
const router = Router();
router.get("/", googleAuth);
router.get("/callback", googleCallback);
export default router;
