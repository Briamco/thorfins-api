import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class AuthModel {
  async register(data: Prisma.UserUncheckedCreateInput) {
    return await prisma.user.create({
      data
    })
  }
  async login(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }
  async getUser(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: { currency: true }
    })
  }
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { currency: true }
    })
  }
  async update(id: string, data: Prisma.UserUncheckedUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }
}

export default new AuthModel()