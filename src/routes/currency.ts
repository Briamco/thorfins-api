import { Router } from "express";
import controllers from "../controllers/currency";

const router = Router()

router.get('/', controllers.getCurrencies)

export { router }