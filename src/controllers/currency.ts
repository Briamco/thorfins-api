import { Request, Response } from 'express'
import model from '../models/currency'
import { Error } from '../interfaces/error'
import { handleHTTP } from '../utils/error.handle'

class CurrencyController {
  async getCurrencies(req: Request, res: Response) {
    try {
      const currencies = await model.getCurrencies()
      res.status(200).json(currencies)
    } catch (e: Error | any) {
      handleHTTP(res, 'Currencies failed', 500)
    }
  }
}

export default new CurrencyController()