import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { ProductsController } from "@controllers/products.controller";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware } from "@middlewares/auth.middleware";
import { RoleMiddleware } from "@middlewares/role.middleware";
import { ValidationMiddleware } from "@middlewares/validation.middleware";
import { createProductSchema, updateProductSchema } from "@dtos/products.dto";

@injectable()
export class ProductsRoute implements Routes {
  public router: Router = Router();
  public path = "/products";

  constructor(
    @inject(ProductsController) private productsController: ProductsController,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // All authenticated users can view products
    this.router.get(
      `${this.path}`,
      AuthMiddleware,
      this.productsController.getProducts,
    );
    this.router.get(
      `${this.path}/:id`,
      AuthMiddleware,
      this.productsController.getProductById,
    );

    // Only Owner and Manager can create/update products
    this.router.post(
      `${this.path}`,
      AuthMiddleware,
      RoleMiddleware(["Owner", "Manager"]),
      ValidationMiddleware(createProductSchema),
      this.productsController.createProduct,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      RoleMiddleware(["Owner", "Manager"]),
      ValidationMiddleware(updateProductSchema),
      this.productsController.updateProduct,
    );

    // Only Owner can delete products
    this.router.delete(
      `${this.path}/:id`,
      AuthMiddleware,
      RoleMiddleware(["Owner"]),
      this.productsController.deleteProduct,
    );
  }
}
