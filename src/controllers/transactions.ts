import { Request, Response } from 'express';
import { Prisma, TransactionType } from "@prisma/client";
import model from '../models/transactions';
import { handleHTTP } from '../utils/error.handle';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

class TransactionController {
  async getTransactions(req: Request, res: Response) {
    const userId = req.userId as string

    try {
      const transactions = await model.getTransactions();

      const userTransactions = transactions.filter(tran => tran.userId === userId)
      res.status(200).json(userTransactions);
    } catch (e: Error | any) {
      console.error('Error getting transactions:', e);
      handleHTTP(res, 'Failed to retrieve transactions', 500);
    }
  }

  async getTransaction(req: Request, res: Response) {
    const userId = req.userId as string
    const { id } = req.params;

    if (!id) {
      return handleHTTP(res, 'Transaction ID is required', 400);
    }

    try {
      const transaction = await model.getTransaction(id);
      if (!transaction) return handleHTTP(res, 'Transaction not found', 404);

      if (transaction.userId !== userId) return handleHTTP(res, 'Transaction not from user', 400)
      res.status(200).json(transaction);
    } catch (e: Error | any) {
      console.error(`Error getting transaction with id ${id}:`, e);
      handleHTTP(res, 'Failed to retrieve transaction', 500);
    }
  }

  async create(req: Request, res: Response) {
    const { amount, desc, categoryId, type } = req.body;
    const userId = req.userId as string;

    if (!userId) {
      return handleHTTP(res, 'User ID is required', 400);
    }

    if (!amount || !categoryId || !type) {
      return handleHTTP(res, 'Amount, categoryId, and type are required', 400);
    }

    if (type !== TransactionType.income && type !== TransactionType.expense) {
      return handleHTTP(res, 'Invalid transaction type', 400);
    }

    const data: Prisma.TransactionUncheckedCreateInput = {
      userId,
      amount,
      type,
      desc: desc || null,
      categoryId,
    };

    try {
      const transaction = await model.create(data);
      res.status(201).json(transaction);
    } catch (e: Error | any) {
      console.error('Error creating transaction:', e);
      handleHTTP(res, 'Failed to create transaction', 500);
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { amount, desc, categoryId } = req.body;
    const userId = req.userId as string;

    if (!id) {
      return handleHTTP(res, 'Transaction ID is required', 400);
    }

    if (!userId) {
      return handleHTTP(res, 'User ID is required', 400);
    }

    if (!amount || !categoryId) {
      return handleHTTP(res, 'Amount and categoryId are required', 400);
    }

    const data: Prisma.TransactionUncheckedUpdateInput = {
      userId,
      amount,
      desc: desc || null,
      updatedAt: new Date(),
      categoryId,
    };

    try {
      const existingTransaction = await model.getTransaction(id);
      if (!existingTransaction) return handleHTTP(res, 'Transaction not found', 404);
      if (existingTransaction.userId !== userId) return handleHTTP(res, 'Transaction not from user', 400)

      const updatedTransaction = await model.update(id, data);
      res.status(200).json(updatedTransaction);
    } catch (e: Error | any) {
      console.error(`Error updating transaction with id ${id}:`, e);
      handleHTTP(res, 'Failed to update transaction', 500);
    }
  }

  async delete(req: Request, res: Response) {
    const userId = req.userId as string
    const { id } = req.params;

    if (!id) {
      return handleHTTP(res, 'Transaction ID is required', 400);
    }

    try {
      const existingTransaction = await model.getTransaction(id);
      if (!existingTransaction) return handleHTTP(res, 'Transaction not found', 404);
      if (existingTransaction.userId !== userId) return handleHTTP(res, 'Transaction not from user', 400)

      await model.delete(id);
      res.status(200).json({ message: `Transaction with id ${id} deleted` });
    } catch (e: Error | any) {
      console.error(`Error deleting transaction with id ${id}:`, e);
      handleHTTP(res, 'Failed to delete transaction', 500);
    }
  }
}

export default new TransactionController();
