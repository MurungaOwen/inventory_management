import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ProductsService } from '@services/products.service';
import { asyncHandler } from '@utils/asyncHandler';

@injectable()
export class ProductsController {
  constructor(@inject(ProductsService) private productsService: ProductsService) {}

  public getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { category, search } = req.query;
    const products = await this.productsService.findAllProduct({
      category: category as string,
      search: search as string,
    });
    res.status(200).json({ data: products.map((p) => p.toPersistence()), message: 'findAll' });
  });

  public getProductById = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = await this.productsService.findProductById(productId);
    res.status(200).json({ data: product.toPersistence(), message: 'findOne' });
  });

  public createProduct = asyncHandler(async (req: Request, res: Response) => {
    const productData = req.body;
    const createProductData = await this.productsService.createProduct(productData);
    res.status(201).json({ data: createProductData.toPersistence(), message: 'created' });
  });

  public updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;
    const productData = req.body;
    const updateProductData = await this.productsService.updateProduct(productId, productData);
    res.status(200).json({ data: updateProductData.toPersistence(), message: 'updated' });
  });

  public deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;
    await this.productsService.deleteProduct(productId);
    res.status(200).json({ message: 'deleted' });
  });
}
