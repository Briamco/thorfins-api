import { Router } from "express";
import controllers from "../controllers/category";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router()

router.get('/', authMiddleware, controllers.getAllCategories)
router.get('/:id', authMiddleware, controllers.getCategory)
router.post('/', authMiddleware, controllers.create)
router.put('/:id', authMiddleware, controllers.update)
router.delete('/:id', authMiddleware, controllers.delete)

export { router }