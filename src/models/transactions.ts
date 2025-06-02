import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class TransactionModel {
  async getTransactions() {
    return await prisma.transaction.findMany({
      include: { category: true }
    })
  }

  async getTransaction(id: string) {
    return await prisma.transaction.findFirst({
      where: { id },
      include: { category: true }
    })
  }

  async create(data: Prisma.TransactionUncheckedCreateInput) {
    return await prisma.transaction.create({
      data
    })
  }

  async update(id: string, data: Prisma.TransactionUncheckedUpdateInput) {
    return prisma.transaction.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return prisma.transaction.delete({
      where: { id }
    })
  }
}

export default new TransactionModel()