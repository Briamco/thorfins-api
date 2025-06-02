import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class CategoryMoedel {
  async getAllCategories() {
    return prisma.category.findMany({
      include: { transaction: true }
    })
  }

  async getCategory(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { transaction: true }
    })
  }

  async createCategoty(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({
      data
    })
  }

  async update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return prisma.category.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    })
  }
}

export default new CategoryMoedel()