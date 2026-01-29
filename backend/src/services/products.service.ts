import { injectable, inject } from "tsyringe";
import { Product, type ProductCreateData } from "@entities/product.entity";
import { ProductsRepository } from "@repositories/products.repository";
import type { IProductsRepository } from "@repositories/products.repository";
import { InventoryRepository } from "@repositories/inventory.repository";
import type { IInventoryRepository } from "@repositories/inventory.repository";
import { Inventory } from "@entities/inventory.entity";
import { HttpException } from "@exceptions/httpException";

@injectable()
export class ProductsService {
  constructor(
    @inject(ProductsRepository) private productsRepository: IProductsRepository,
    @inject(InventoryRepository)
    private inventoryRepository: IInventoryRepository,
  ) {}

  public async findAllProduct(params?: {
    category?: string;
    search?: string;
  }): Promise<Product[]> {
    return this.productsRepository.findAll(params);
  }

  public async findProductById(productId: string): Promise<Product> {
    const findProduct = await this.productsRepository.findById(productId);
    if (!findProduct) throw new HttpException(404, "Product doesn't exist");
    return findProduct;
  }

  public async createProduct(productData: ProductCreateData): Promise<Product> {
    const findProduct = await this.productsRepository.findBySku(
      productData.sku,
    );
    if (findProduct)
      throw new HttpException(
        409,
        `Product with SKU ${productData.sku} already exists`,
      );

    const newProduct = Product.create(productData);
    await this.productsRepository.save(newProduct);

    // Create initial inventory
    const initialInventory = Inventory.create(newProduct.id, 0, 10); // Default 0 stock, 10 threshold
    await this.inventoryRepository.save(initialInventory);

    return newProduct;
  }

  public async updateProduct(
    productId: string,
    productData: Partial<ProductCreateData>,
  ): Promise<Product> {
    const findProduct = await this.productsRepository.findById(productId);
    if (!findProduct) throw new HttpException(404, "Product doesn't exist");

    if (productData.sku && productData.sku !== findProduct.sku) {
      const findSku = await this.productsRepository.findBySku(productData.sku);
      if (findSku)
        throw new HttpException(
          409,
          `Product with SKU ${productData.sku} already exists`,
        );
    }

    findProduct.update(productData);
    await this.productsRepository.update(productId, findProduct);
    return findProduct;
  }

  public async deleteProduct(productId: string): Promise<Product> {
    const findProduct = await this.productsRepository.findById(productId);
    if (!findProduct) throw new HttpException(404, "Product doesn't exist");

    await this.productsRepository.delete(productId);
    return findProduct;
  }
}
