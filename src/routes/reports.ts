import { Router } from "express";
import controllers from "../controllers/reports";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router()

router.get('/amounts', authMiddleware, controllers.getAmounts)

export { router }