import { NextFunction, Response, Request } from "express";
import { RequestWithUser } from "@interfaces/auth.interface";
import { HttpException } from "@exceptions/httpException";
import { UserRole } from "@entities/user.entity";

export const RoleMiddleware = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as RequestWithUser).user;
      if (!user) {
        next(new HttpException(401, "Authentication token missing"));
        return;
      }

      if (!roles.includes(user.role)) {
        next(new HttpException(403, "Insufficient permissions"));
        return;
      }

      next();
    } catch {
      next(new HttpException(401, "Wrong authentication token"));
    }
  };
};
