import express from "express";
import type { IUser } from "../types/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
app.use(express.json());

//* Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

//* Compare a password with its hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

//* Generate JWT token
export const generateToken = (user: IUser): string => {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

//* Verify JWT token
export const verifyToken = (token: string): { userId: string; username: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
};
