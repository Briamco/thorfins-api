import { Request, Response } from 'express';
import { handleHTTP } from '../utils/error.handle';
import transactionsModel from '../models/transactions';
import { TransactionType } from "../../prisma/generated/client";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

class ReportController {
  async getAmounts(req: Request, res: Response) {
    const userId = req.userId as string;

    if (!userId) {
      return handleHTTP(res, 'User ID is required', 400);
    }

    try {
      const transactions = await transactionsModel.getTransactions();
      if (!transactions) {
        return handleHTTP(res, 'Transactions not found', 404);
      }

      const userTransactions = transactions.filter(tran => tran.userId === userId);

      const totalIncome = userTransactions
        .filter(tran => tran.type === TransactionType.income)
        .reduce((sum, tran) => sum + tran.amount, 0);

      const totalExpense = userTransactions
        .filter(tran => tran.type === TransactionType.expense)
        .reduce((sum, tran) => sum + tran.amount, 0);

      const total = totalIncome - totalExpense;

      const amounts = {
        total,
        totalExpense,
        totalIncome,
      };

      res.status(200).json(amounts);
    } catch (e: Error | any) {
      console.error('Error getting amounts:', e);
      handleHTTP(res, 'Failed to retrieve amounts', 500);
    }
  }
}

export default new ReportController();
