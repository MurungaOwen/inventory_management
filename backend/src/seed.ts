import "reflect-metadata";
import { container } from "tsyringe";
import { User, UserCreateData } from "@entities/user.entity";
import { UsersRepository } from "@repositories/users.repository";
import { ProductsService } from "@services/products.service";
import { ProductsRepository } from "@repositories/products.repository";
import { InventoryRepository } from "@repositories/inventory.repository";
import { NotificationsService } from "@services/notifications.service";
import { NotificationsRepository } from "@repositories/notifications.repository";
import { logger } from "@utils/logger";
import { pool } from "@config/db.config";

// Register dependencies
container.register(UsersRepository, { useClass: UsersRepository });
container.register(ProductsRepository, { useClass: ProductsRepository });
container.register(InventoryRepository, { useClass: InventoryRepository });
container.register(NotificationsRepository, {
  useClass: NotificationsRepository,
});
container.register(NotificationsService, { useClass: NotificationsService });
container.register(ProductsService, { useClass: ProductsService });

const seed = async () => {
  try {
    logger.info("Starting database seed...");

    const usersRepo = container.resolve(UsersRepository);
    const productsService = container.resolve(ProductsService);

    // 1. Create Users
    const users: UserCreateData[] = [
      {
        email: "owner@hardware.com",
        password: "Password123!",
        fullName: "John Owner",
        role: "Owner",
        phone: "0700111222",
      },
      {
        email: "manager@hardware.com",
        password: "Password123!",
        fullName: "Jane Manager",
        role: "Manager",
        phone: "0700333444",
      },
      {
        email: "cashier@hardware.com",
        password: "Password123!",
        fullName: "Bob Cashier",
        role: "Cashier",
        phone: "0700555666",
      },
    ];

    for (const userData of users) {
      const existing = await usersRepo.findByEmail(userData.email);
      if (!existing) {
        const user = await User.create(userData);
        await usersRepo.save(user);
        logger.info(`Created user: ${userData.email}`);
      } else {
        logger.info(`User already exists: ${userData.email}`);
      }
    }

    // 2. Create Products
    const products = [
      {
        sku: "CEM-001",
        name: "Simba Cement",
        category: "Building Materials",
        supplier: "Simba Corp",
        unit: "bag",
        costPrice: 650,
        sellingPrice: 800,
        description: "50kg Portland Cement",
      },
      {
        sku: "NAIL-2IN",
        name: "2 Inch Nails",
        category: "Hardware",
        supplier: "Steel Works",
        unit: "kg",
        costPrice: 150,
        sellingPrice: 250,
        description: "Common wire nails",
      },
      {
        sku: "PNT-WHT-4L",
        name: "Crown White Paint",
        category: "Paints",
        supplier: "Crown Paints",
        unit: "liter",
        costPrice: 2500,
        sellingPrice: 3200,
        description: "4L Silk Vinyl",
      },
      {
        sku: "HAM-CLAW",
        name: "Claw Hammer",
        category: "Tools",
        supplier: "Stanley",
        unit: "pcs",
        costPrice: 800,
        sellingPrice: 1200,
        description: "16oz Claw Hammer with fiberglass handle",
      },
      {
        sku: "BULB-LED-9W",
        name: "9W LED Bulb",
        category: "Electrical",
        supplier: "Philips",
        unit: "pcs",
        costPrice: 150,
        sellingPrice: 250,
        description: "Cool daylight E27 base",
      },
    ];

    for (const productData of products) {
      try {
        await productsService.createProduct(productData as any);
        logger.info(`Created product: ${productData.name}`);
      } catch (error: any) {
        if (error.status === 409) {
          logger.info(`Product already exists: ${productData.name}`);
        } else {
          logger.error(`Failed to create product ${productData.name}:`, error);
        }
      }
    }

    logger.info("Database seed completed successfully");
  } catch (error) {
    logger.error({ error }, "Seed failed");
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  seed();
}
