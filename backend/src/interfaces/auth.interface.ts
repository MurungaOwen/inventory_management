import type { Request } from "express";
import { User } from "@entities/user.entity";

export interface DataStoredInToken {
  id: string;
  role: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
