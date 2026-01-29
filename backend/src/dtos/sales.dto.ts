import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  paymentMethod: z.enum(["Cash", "Mobile Money"]),
  items: z.array(saleItemSchema).min(1),
});
