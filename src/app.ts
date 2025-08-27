import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router, authRouter } from './routes'

const app = express()

app.use(express.json())
app.use(cors())
app.use('/api', router)
app.use('/auth', authRouter)

export default app