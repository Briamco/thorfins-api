import { Router } from "express";
import controllers from "../controllers/transactions";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router()

router.get('/', authMiddleware, controllers.getTransactions)
router.get('/:id', authMiddleware, controllers.getTransaction)
router.post('/', authMiddleware, controllers.create)
router.put('/:id', authMiddleware, controllers.update)
router.delete('/:id', authMiddleware, controllers.delete)

export { router }