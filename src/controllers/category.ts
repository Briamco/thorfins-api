import { Request, Response } from "express";
import { Error } from "../interfaces/error";
import { handleHTTP } from "../utils/error.handle";
import model from '../models/category'
import { Prisma } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

class CategoryController {
  async getAllCategories(req: Request, res: Response) {
    const userId = req.userId as string;

    try {
      const categories = await model.getAllCategories();
      const userCategories = categories
        .filter(cat => cat.userId === userId || cat.userId === null)
        .map(cat => ({
          ...cat,
          transaction: cat.transaction.filter(tran => tran.userId === userId)
        }));
      res.status(200).json(userCategories);
    } catch (e: Error | any) {
      console.error("Error getting all categories:", e);
      handleHTTP(res, "Failed to retrieve categories", 500);
    }
  }

  async getCategory(req: Request, res: Response) {
    const userId = req.userId as string;
    const { id } = req.params;
    if (!id) {
      return handleHTTP(res, "Category ID is required", 400);
    }
    try {
      const category = await model.getCategory(id);
      if (!category) return handleHTTP(res, "Category not found", 404);

      if (category.userId === null || category.userId === userId) {
        const userCategory = {
          ...category,
          transaction: category.transaction.filter(tran => tran.userId === userId)
        }

        res.status(200).json(userCategory);
      } else handleHTTP(res, "Category is not from user", 400);
    } catch (e: Error | any) {
      console.error(`Error getting category with id ${id}:`, e);
      handleHTTP(res, "Failed to retrieve category", 500);
    }
  }

  async create(req: Request, res: Response) {
    const { name, icon } = req.body;
    const userId = req.userId as string;

    if (!userId) {
      return handleHTTP(res, "User not found", 404);
    }

    if (!name || name.trim() === '' || !icon || icon.trim() === '') {
      return handleHTTP(res, "Name and icon are required", 400);
    }

    const data: Prisma.CategoryUncheckedCreateInput = {
      userId,
      name,
      icon,
    };

    try {
      const category = await model.createCategoty(data);
      res.status(201).json(category);
    } catch (e: Error | any) {
      console.error("Error creating category:", e);
      handleHTTP(res, "Failed to create category", 500);
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, icon } = req.body;
    const userId = req.userId as string;

    if (!id) {
      return handleHTTP(res, "Category ID is required", 400);
    }

    if (!userId) {
      return handleHTTP(res, "User not found", 404);
    }

    if (!name || name.trim() === '' || !icon || icon.trim() === '') {
      return handleHTTP(res, "Name and icon are required", 400);
    }

    const data: Prisma.CategoryUncheckedCreateInput = {
      userId,
      name,
      icon,
    };

    try {
      const categoryToUpdate = await model.getCategory(id);
      if (!categoryToUpdate) {
        return handleHTTP(res, "Category not found", 404);
      }

      if (!categoryToUpdate.editable) {
        return handleHTTP(res, "This category is not editable", 400);
      }

      const updatedCategory = await model.update(id, data);
      res.status(200).json(updatedCategory);
    } catch (e: Error | any) {
      console.error(`Error updating category with id ${id}:`, e);
      handleHTTP(res, "Failed to update category", 500);
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return handleHTTP(res, "Category ID is required", 400);
    }
    try {
      const categoryToDelete = await model.getCategory(id);
      if (!categoryToDelete) {
        return handleHTTP(res, "Category not found", 404);
      }
      if (!categoryToDelete.editable) {
        return handleHTTP(res, "This category is not deletable", 400);
      }

      await model.delete(id)
      res.status(200).json({ message: `Category with id: ${id} deleted` });
    } catch (e: Error | any) {
      console.error(`Error deleting category with id ${id}:`, e);
      handleHTTP(res, "Failed to delete category", 500);
    }
  }
}

export default new CategoryController();
