import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class CurrencyModel {
  async getCurrencies() {
    return await prisma.currency.findMany()
  }
}

export default new CurrencyModel()