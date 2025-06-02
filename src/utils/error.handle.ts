import { Response } from "express";

const handleHTTP = (res: Response, error: string, status: number = 500) => {
  res.status(status)
  res.send({ error })
}

export { handleHTTP }