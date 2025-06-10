import { type Request, type Response } from "express";
import { hashPassword, comparePassword, generateToken } from "../middleware/auth";
import type { IUser } from "../types/User";
import fs from "fs/promises";
import path from "path";

// * Register

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, cif, fname, lname, mobile } = req.body;
  const dataPath = path.join("src/controllers/userControllers.ts", "..", "data", "data.json"); // Fixed path

  // Validate fields
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });
  if (!cif) return res.status(400).json({ error: "cif is required" });
  if (!fname) return res.status(400).json({ error: "fname is required" });
  if (!lname) return res.status(400).json({ error: "lname is required" });
  if (!mobile) return res.status(400).json({ error: "mobile is required" });

  try {
    // Read or initialize data
    let data: string;
    try {
      data = await fs.readFile(dataPath, "utf-8");
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === "ENOENT") {
        data = "[]"; // Default to empty array
      } else {
        throw readError;
      }
    }

    const users: IUser[] = JSON.parse(data);

    // Check for existing user
    if (users.some((u) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password and add user
    const passwordHash = await hashPassword(password);
    users.push({ email, password: passwordHash, cif, fname, lname, mobile });

    // Ensure directory exists
    await fs.mkdir(path.dirname(dataPath), { recursive: true });

    // Write to file
    await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

// * Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const dataPath = path.join("src/controllers/userControllers.ts", "..", "data", "data.json"); // Same path as register

  // Validate fields
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  try {
    // Read or initialize data
    let data: string;
    try {
      data = await fs.readFile(dataPath, "utf-8");
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === "ENOENT") {
        data = "[]"; // Default to empty array
      } else {
        throw readError;
      }
    }

    const users: IUser[] = JSON.parse(data);

    // Find user by email
    const user = users.find((u: IUser) => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid user" });

    // Compare password with hashed password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid Password" });

    // Generate and return token
    const token = generateToken(user);
    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};
