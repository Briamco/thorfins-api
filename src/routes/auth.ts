import { Router } from "express";
import controllers from "../controllers/auth";
import authMiddleware from "../middlewares/authMiddleware";

const authRouter = Router()

authRouter.post('/register', controllers.register)
authRouter.post('/login', controllers.login)
authRouter.post('/logout', controllers.logout)
authRouter.get('/me', authMiddleware, controllers.me)
authRouter.put('/me/update', authMiddleware, controllers.updateUser)
authRouter.put('/changepass', controllers.updatePassword)
authRouter.post('/verify', controllers.verify)
authRouter.put('/resendCode', controllers.resendCode)

export { authRouter }