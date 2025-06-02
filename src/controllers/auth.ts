import { Request, Response } from 'express';
import model from '../models/auth';
import { handleHTTP } from '../utils/error.handle';
import { Prisma } from "../../prisma/generated/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Error } from '../interfaces/error';
import { sendCode } from '../utils/email';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000);

class AuthController {
  async register(req: Request, res: Response) {
    const { name, email, password, currencyId } = req.body;

    if (!name || name.trim() === '' || !email || email.trim() === '' || !password || password.trim() === '' || !currencyId) {
      return handleHTTP(res, 'All parameters are required', 400);
    }

    try {
      const existingUser = await model.login(email); //check if email is in use
      if (existingUser) {
        return handleHTTP(res, 'Email already in use', 400);
      }
      const verifyCode = generateVerificationCode();
      const hashed = await bcrypt.hash(password, 10);

      const data: Prisma.UserUncheckedCreateInput = {
        name,
        email,
        verifyCode,
        password: hashed,
        currencyId,
      };

      const user = await model.register(data);
      if (!user) {
        return handleHTTP(res, 'Failed to register user', 500);
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
      sendCode(email, verifyCode);
      res.status(201).json({ token, user });
    } catch (e: Error | any) {
      console.error('Error during registration:', e);
      handleHTTP(res, 'Registration failed', 500);
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || email.trim() === '' || !password || password.trim() === '') {
      return handleHTTP(res, 'Email and password are required', 400);
    }

    try {
      const user = await model.login(email);
      if (!user) {
        return handleHTTP(res, 'User not found', 404);
      }

      const isVerified = user.verified;
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return handleHTTP(res, 'Incorrect password', 400);
      }

      if (!isVerified) {
        return handleHTTP(res, 'User not verified', 403);
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
      res.status(200).json({ token, user });
    } catch (e: Error | any) {
      console.error('Error during login:', e);
      handleHTTP(res, 'Login failed', 500);
    }
  }

  async me(req: Request, res: Response) {
    const userId = req.userId as string

    if (!userId) {
      return handleHTTP(res, 'User ID is required', 400);
    }

    try {
      const user = await model.getUser(userId)

      if (!user) return handleHTTP(res, 'User not found', 404);

      res.status(200).json(user)
    } catch (e: Error | any) {
      console.error('Error during login:', e);
      handleHTTP(res, 'Getting user failed', 500);
    }
  }

  async verify(req: Request, res: Response) {
    const { code, email } = req.body;

    if (!email) {
      return handleHTTP(res, 'Email is required', 400);
    }
    if (!code) {
      return handleHTTP(res, 'Verification code is required', 400);
    }

    try {
      const user = await model.getUserByEmail(email);
      if (!user) {
        return handleHTTP(res, 'User not found', 404);
      }

      const isVerified = parseInt(code, 10) === user.verifyCode;
      const isExpired = (Date.now() - new Date(user.updatedAt).getTime()) > 1000 * 60 * 10; // 10 minutes

      if (isVerified && !isExpired) {
        const data: Prisma.UserUncheckedUpdateInput = {
          verified: true,
          updatedAt: new Date()
        };
        await model.update(user.id, data);
        res.status(200).json({ message: 'User verified successfully' });
      } else if (!isVerified) {
        return handleHTTP(res, 'Invalid verification code', 400);
      } else {
        return handleHTTP(res, 'Verification code expired', 410);
      }
    } catch (e: Error | any) {
      console.error('Error during verification:', e);
      handleHTTP(res, 'Verification failed', 500);
    }
  }

  async resendCode(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return handleHTTP(res, 'Email is required', 400);
    }

    try {
      const user = await model.getUserByEmail(email);
      if (!user) {
        return handleHTTP(res, 'User not found', 404);
      }

      const isExpired = (Date.now() - new Date(user.updatedAt).getTime()) > 1000 * 60 * 10; // 10 minutes
      const newVerifyCode = generateVerificationCode();
      const updateData: Prisma.UserUncheckedUpdateInput = {
        verifyCode: newVerifyCode,
        updatedAt: new Date(),
      };

      sendCode(email, isExpired ? newVerifyCode : user.verifyCode); //send new code regardless of expiration
      if (isExpired) await model.update(user.id, updateData);

      res.status(200).json({ message: isExpired ? 'New code sent' : 'Code resent' });
    } catch (e: Error | any) {
      console.error('Error resending code:', e);
      handleHTTP(res, 'Failed to resend code', 500);
    }
  }

  async updateUser(req: Request, res: Response) {
    const userId = req.userId as string;
    const { currencyId } = req.body

    if (!currencyId) handleHTTP(res, "Currency ID is required", 400)

    const data: Prisma.UserUncheckedUpdateInput = {
      currencyId,
      updatedAt: new Date()
    }

    try {
      const updatedUser = await model.update(userId, data)

      res.status(200).json(updatedUser);
    } catch (e: Error | any) {
      console.error('Error updating user:', e);
      handleHTTP(res, 'Failed to update', 500);
    }
  }

  //TODO: verification code
  async updatePassword(req: Request, res: Response) {
    const { email } = req.query
    const { newPassword } = req.body
    // const verifyCode = generateVerificationCode()

    if (!email) {
      return handleHTTP(res, "Email is required", 400);
    }
    if (typeof email !== 'string') {
      return handleHTTP(res, "Email must be a string", 400);
    }

    if (!newPassword) {
      return handleHTTP(res, "New Password is required", 400);
    }

    const user = await model.getUserByEmail(email);
    if (!user) {
      return handleHTTP(res, "User not found", 404);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return handleHTTP(res, "New password cannot be the same as the old password", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);


    const data: Prisma.UserUncheckedUpdateInput = {
      email,
      password: hashedPassword,
      // verifyCode,
      // verified: false,
      updatedAt: new Date()
    }

    try {
      const updatedUser = await model.update(user.id, data);

      if (!updatedUser) {
        return handleHTTP(res, "Failed to update password", 500);
      }

      // sendCode(email, verifyCode)
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error: Error | any) {
      console.error('Error updating user password:', error);
      if (error instanceof Error && error.message === "User not found") {
        handleHTTP(res, "User not found", 404);
      } else {
        handleHTTP(res, 'Failed to update password', 500);
      }
    }
  }

  async logout(req: Request, res: Response) {
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

export default new AuthController();
